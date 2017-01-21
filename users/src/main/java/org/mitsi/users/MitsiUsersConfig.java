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

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;

import com.google.gson.Gson;

public class MitsiUsersConfig extends PooledResource {
	private static final Logger log = Logger.getLogger(MitsiUsersConfig.class);

	public static final String PASSWORD_PREFIX_CLEAR = "{clear}";
	public static final String PASSWORD_PREFIX_SSHA256 = "{ssha256}";
	public static final String PASSWORD_SALT_SEP = ":";

	public static final String GROUP_PUBLIC = "_public"; // all users even if they are not authenticated
	public static final String GROUP_CONNECTED = "_connected"; // all authenticated users

	@Autowired
	private Resource usersFile; 

	private MitsiUsersFile usersFileLoaded;

	class User {
		
		public User(String username, String encodedPassword) {
			super();
			this.username = username;
			this.encodedPassword = encodedPassword;
		}
		public String username;
		public String encodedPassword;
	}
	Map<String, User> users = null;
	
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
				users = new HashMap<String, User>();
				for(Entry<String, String> userAndPassword : usersFileLoaded.users.entrySet()) {
					String username = userAndPassword.getKey();
					String encodedPassword = userAndPassword.getValue();
					users.put(username, new User(username, encodedPassword));
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
			// TODO vérifier que ce calcul de ssha n'est pas incorrect
			int i = encodedPassword.indexOf(PASSWORD_SALT_SEP);
			if(i <= 0) {
				// TODO : log error
				throw new MitsiUsersException("wrong password format for user "+username);
			}
			
			String saltHexa = encodedPassword.substring(PASSWORD_PREFIX_SSHA256.length(), i);
			String toHash = saltHexa+PASSWORD_SALT_SEP+password;
			try {
				MessageDigest digest = MessageDigest.getInstance("SHA-256");
				byte[] hash = digest.digest(toHash.getBytes(StandardCharsets.UTF_8));
				String hexaHash = toHexaString(hash);
				checkPassword = PASSWORD_PREFIX_SSHA256+saltHexa+PASSWORD_SALT_SEP+hexaHash;
				return encodedPassword.equalsIgnoreCase(checkPassword);
			}
			catch(NoSuchAlgorithmException e) {
				throw new MitsiUsersException("cannot SHA-256", e);
			}
		}

		// TODO : log error
		throw new MitsiUsersException("wrong password format for user "+username);
		
	}
	
	// a déplacer dans un package commons
	final protected static char[] hexArray = "0123456789ABCDEF".toCharArray();
	public static String toHexaString(byte [] bytes) {
	    char[] hexChars = new char[bytes.length * 2];
	    for ( int j = 0; j < bytes.length; j++ ) {
	        int v = bytes[j] & 0xFF;
	        hexChars[j * 2] = hexArray[v >>> 4];
	        hexChars[j * 2 + 1] = hexArray[v & 0x0F];
	    }
	    return new String(hexChars);
	}
	
	public boolean isLdapEnabled() {
		return usersFileLoaded.ldapAuthent != null;
	}
	
	public String getLdapUrl() {
		if(usersFileLoaded.ldapAuthent == null) {
			return null;
		}
		return usersFileLoaded.ldapAuthent.url;
	}
	
	public String getLdapApplicationDN() {
		if(usersFileLoaded.ldapAuthent == null) {
			return null;
		}
		return usersFileLoaded.ldapAuthent.applicationDN;
	}
	
	public String getLdapApplicationPassword() {
		if(usersFileLoaded.ldapAuthent == null) {
			return null;
		}
		return usersFileLoaded.ldapAuthent.applicationPassword;
	}
	
	public String getLdapUserDNPattern() {
		if(usersFileLoaded.ldapAuthent == null) {
			return null;
		}
		return usersFileLoaded.ldapAuthent.userDNPattern;
	}
	     
	public String getLdapGroupSearchPattern() {
		if(usersFileLoaded.ldapAuthent == null) {
			return null;
		}
		return usersFileLoaded.ldapAuthent.groupSearchPattern;
	}
	
	public String getLdapGroupRoleAttribute() {
		if(usersFileLoaded.ldapAuthent == null) {
			return null;
		}
		return usersFileLoaded.ldapAuthent.groupRoleAttribute;
	}
	
	public String getLdapMandatoryRole() {
		if(usersFileLoaded.ldapAuthent == null) {
			return null;
		}
		return usersFileLoaded.ldapAuthent.mandatoryRole;
	}       
	
	public Map<String, String[]> getGroups() {
		return usersFileLoaded.groups;
	}

}
