package org.mitsi.users;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;
import java.util.TreeSet;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.mitsi.commons.MitsiStringUtils;

import com.google.gson.Gson;

public class MitsiUsersConfigImpl extends PooledResource implements MitsiUsersConfig {
	private static final Logger log = Logger.getLogger(MitsiUsersConfigImpl.class);

	@Autowired
	private Resource usersFile; 

	private MitsiUsersFile usersFileLoaded;

	class User {
		
		public User(String username, String encodedPassword) {
			this.username = username;
			this.encodedPassword = encodedPassword;
		}
		public String username;
		public String encodedPassword;
	}
	// map of users configured in file
	Map<String, User> users = null;
	// maps of user groups, for users configured in file OR in ldap
	Map<String, TreeSet<String>> userGroups = null;
	
	@Override
	public Date getResourceTimestamp() {
		long l = 0;
		try {
			l = usersFile.getFile().lastModified();
		}
		catch(Exception e) {
			//nothing
		}
		if(l>0) {
			return new Date(l);
		}
		return null;
	}
	
	@Override
	public void load() {

		try {
			log.info("loading '"+usersFile.getFilename()+"' (path:"+usersFile.getFile().getPath()+")");
			try(InputStreamReader isr = new InputStreamReader(usersFile.getInputStream(), StandardCharsets.UTF_8);
				BufferedReader bfr = new BufferedReader(isr)) {
			
				Gson gson = new Gson();
				usersFileLoaded = gson.fromJson(bfr, MitsiUsersFile.class);
				users = new HashMap<>();
				if(usersFileLoaded.users != null) {
					for(Entry<String, String> userAndPassword : usersFileLoaded.users.entrySet()) {
						String username = userAndPassword.getKey();
						String encodedPassword = userAndPassword.getValue();
						users.put(username, new User(username, encodedPassword));
					}	
				}
				
				this.userGroups = new HashMap<>();
				if(usersFileLoaded.groups != null) {
					for(Entry<String, String[]> groupEntry : usersFileLoaded.groups.entrySet()) {
						String group = groupEntry.getKey();
						String [] groupGrantees = groupEntry.getValue();
						for(String grantee : groupGrantees) {
							// TODO : groups containing other groups (spoiler alert : will need to be protected against cycles)
							// grantee is a user
							if(!userGroups.containsKey(grantee)) {
								userGroups.put(grantee, new TreeSet<String>());
							}
							userGroups.get(grantee).add(group);
						}
					}	
				}

			}			
		}
		catch(IOException e) {
			try {
				log.error("cannot load mitsi users config :'"+usersFile.getFilename()+"' (path:"+usersFile.getFile().getPath()+")", e);
			} catch (IOException e1) {
				log.error(e1);
			}
		}
		
	}

	@Override
	public boolean authenticate(String username, String password) throws MitsiUsersException {
		User user = users.get(username);
		if(user == null) {
			return false;
		}
		
		String encodedPassword = user.encodedPassword;
		String checkPassword = null;
		if(encodedPassword.toLowerCase().startsWith(PASSWORD_PREFIX_CLEAR)) {
			checkPassword = PASSWORD_PREFIX_CLEAR+password;
			return encodedPassword.equals(checkPassword);
		}
		else if(encodedPassword.toLowerCase().startsWith(PASSWORD_PREFIX_SSHA256)) {
			int i = encodedPassword.indexOf(PASSWORD_SALT_SEP);
			if(i <= 0) {
				log.error("wrong password format for user "+username);
				throw new MitsiUsersException("wrong password format for user "+username);
			}
			
			String saltHexa = encodedPassword.substring(PASSWORD_PREFIX_SSHA256.length(), i);
			String toHash = saltHexa+PASSWORD_SALT_SEP+password;
			try {
				MessageDigest digest = MessageDigest.getInstance("SHA-256");
				byte[] hash = digest.digest(toHash.getBytes(StandardCharsets.UTF_8));
				String hexaHash = MitsiStringUtils.toHexaString(hash);
				checkPassword = PASSWORD_PREFIX_SSHA256+saltHexa+PASSWORD_SALT_SEP+hexaHash;
				return encodedPassword.equalsIgnoreCase(checkPassword);
			}
			catch(NoSuchAlgorithmException e) {
				throw new MitsiUsersException("cannot SHA-256", e);
			}
		}

		log.error("wrong password format for user "+username);
		throw new MitsiUsersException("wrong password format for user "+username);
		
	}
	
	@Override
	public boolean isLdapEnabled() {
		return usersFileLoaded.ldapAuthent != null;
	}
	
	@Override
	public String getLdapUrl() {
		if(usersFileLoaded.ldapAuthent == null) {
			return null;
		}
		return usersFileLoaded.ldapAuthent.url;
	}
	
	@Override
	public String getLdapApplicationDN() {
		if(usersFileLoaded.ldapAuthent == null) {
			return null;
		}
		return usersFileLoaded.ldapAuthent.applicationDN;
	}
	
	@Override
	public String getLdapApplicationPassword() {
		if(usersFileLoaded.ldapAuthent == null) {
			return null;
		}
		return usersFileLoaded.ldapAuthent.applicationPassword;
	}
	
	@Override
	public String getLdapUserDNPattern() {
		if(usersFileLoaded.ldapAuthent == null) {
			return null;
		}
		return usersFileLoaded.ldapAuthent.userDNPattern;
	}
	     
	@Override
	public String getLdapGroupSearchPattern() {
		if(usersFileLoaded.ldapAuthent == null) {
			return null;
		}
		return usersFileLoaded.ldapAuthent.groupSearchPattern;
	}
	
	@Override
	public String getLdapGroupRoleAttribute() {
		if(usersFileLoaded.ldapAuthent == null) {
			return null;
		}
		return usersFileLoaded.ldapAuthent.groupRoleAttribute;
	}
	
	@Override
	public String getLdapMandatoryRole() {
		if(usersFileLoaded.ldapAuthent == null) {
			return null;
		}
		return usersFileLoaded.ldapAuthent.mandatoryRole;
	}       
	
	@Override
	public Map<String, String[]> getGroups() {
		return usersFileLoaded.groups;
	}
	
	@Override
	public TreeSet<String> getUserGrantedGroups(String username) {
		if(username == null) {
			return null;
		}
		return userGroups.get(username);
	}

}