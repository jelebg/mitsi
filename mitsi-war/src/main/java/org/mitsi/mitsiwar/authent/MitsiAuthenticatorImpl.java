package org.mitsi.mitsiwar.authent;



import javax.annotation.PostConstruct;

import org.mitsi.users.MitsiUsersConfig;
import org.mitsi.users.MitsiUsersException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.ldap.DefaultSpringSecurityContextSource;
import org.springframework.security.ldap.authentication.BindAuthenticator;
import org.springframework.security.ldap.authentication.LdapAuthenticationProvider;
import org.springframework.security.ldap.userdetails.DefaultLdapAuthoritiesPopulator;


public class MitsiAuthenticatorImpl implements MitsiAuthenticator {
	
	LdapAuthenticationProvider ldapAuthProvider;
	
	@Autowired
	MitsiUsersConfig mitsiUsersConfig;
	
	@PostConstruct
	public void postConstruct() {
		mitsiUsersConfig.loadIfNeccessary();
		if(mitsiUsersConfig.isLdapEnabled()) {
			
			DefaultSpringSecurityContextSource contextSource = new DefaultSpringSecurityContextSource(mitsiUsersConfig.getLdapUrl());
			contextSource.setUserDn(mitsiUsersConfig.getLdapApplicationDN());
			contextSource.setPassword(mitsiUsersConfig.getLdapApplicationPassword());
			contextSource.afterPropertiesSet();
			
			
			BindAuthenticator bindAuthenticator = new BindAuthenticator(contextSource);
			String [] userDnPatterns = new String[1];
			userDnPatterns[0] = mitsiUsersConfig.getLdapUserDNPattern();
			bindAuthenticator.setUserDnPatterns(userDnPatterns);
			
			DefaultLdapAuthoritiesPopulator defaultLdapAuthoritiesPopulator =
					new DefaultLdapAuthoritiesPopulator(contextSource,
							mitsiUsersConfig.getLdapGroupSearchPattern());
			defaultLdapAuthoritiesPopulator.setGroupRoleAttribute(mitsiUsersConfig.getLdapGroupRoleAttribute());
			
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
		mitsiUsersConfig.loadIfNeccessary();
		return mitsiUsersConfig.authenticate(username, password);
	}
	
	public boolean authenticateLDAP(String username, String password) {
		Authentication authentication = ldapAuthProvider.authenticate(new UsernamePasswordAuthenticationToken(username, password));
		// TODO : recupérer et utiliser les infos renvoyées par l'authent
		// TODO : checker le role
		return authentication!=null;
	}



}
