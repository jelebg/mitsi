package org.mitsi.mitsiwar.authent;



import javax.annotation.PostConstruct;

import org.apache.log4j.Logger;
import org.mitsi.users.MitsiUsersConfig;
import org.mitsi.users.MitsiUsersException;
import org.mitsi.users.MitsiUsersFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.ldap.DefaultSpringSecurityContextSource;
import org.springframework.security.ldap.authentication.BindAuthenticator;
import org.springframework.security.ldap.authentication.LdapAuthenticationProvider;
import org.springframework.security.ldap.userdetails.DefaultLdapAuthoritiesPopulator;


public class MitsiAuthenticatorImpl implements MitsiAuthenticator {
	private static final Logger log = Logger.getLogger(MitsiAuthenticatorImpl.class);

	LdapAuthenticationProvider ldapAuthProvider;
	
	@Autowired
	MitsiUsersConfig mitsiUsersConfig;
	
	@PostConstruct
	public void postConstruct() {
		mitsiUsersConfig.loadIfNecessary();
		MitsiUsersFile.LdapAuthent ldapAuthent = mitsiUsersConfig.getLdapAuthent();
		if (ldapAuthent != null) {
			
			DefaultSpringSecurityContextSource contextSource = new DefaultSpringSecurityContextSource(ldapAuthent.url);
			contextSource.setUserDn(ldapAuthent.applicationDN);
			contextSource.setPassword(ldapAuthent.applicationPassword);
			contextSource.afterPropertiesSet();
			
			
			BindAuthenticator bindAuthenticator = new BindAuthenticator(contextSource);
			String [] userDnPatterns = new String[1];
			userDnPatterns[0] = ldapAuthent.userDNPattern;
			bindAuthenticator.setUserDnPatterns(userDnPatterns);
			
			DefaultLdapAuthoritiesPopulator defaultLdapAuthoritiesPopulator =
					new DefaultLdapAuthoritiesPopulator(contextSource,
							ldapAuthent.groupSearchPattern);
			defaultLdapAuthoritiesPopulator.setGroupRoleAttribute(ldapAuthent.groupRoleAttribute);
			
			ldapAuthProvider = new LdapAuthenticationProvider(bindAuthenticator, defaultLdapAuthoritiesPopulator);
		}
	}
		
	@Override
	public boolean authenticate(String username, String password) throws MitsiUsersException {
		if(ldapAuthProvider != null) {
			if(authenticateLDAP(username, password)) {
				return true;
			}
		}
		mitsiUsersConfig.loadIfNecessary();
		return mitsiUsersConfig.authenticate(username, password);
	}
	
	@SuppressWarnings("squid:S1166")
	public boolean authenticateLDAP(String username, String password) {
		Authentication authentication = null;
		try {
			authentication = ldapAuthProvider.authenticate(new UsernamePasswordAuthenticationToken(username, password));
		}
		catch(org.springframework.security.core.AuthenticationException e) {
			// nothing
		}
		// TODO : recupérer et utiliser les infos renvoyées par l'authent
		// TODO : checker le role
		return authentication!=null;
	}



}
