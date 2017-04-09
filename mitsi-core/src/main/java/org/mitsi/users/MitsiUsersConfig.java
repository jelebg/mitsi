package org.mitsi.users;

import java.util.Map;
import java.util.SortedSet;
import java.lang.SuppressWarnings;

@SuppressWarnings("squid:S2068") // here, constants with the prefix PASSWORD are not passwords
public interface MitsiUsersConfig {
	public static final String PASSWORD_PREFIX_CLEAR = "{clear}";
	public static final String PASSWORD_PREFIX_SSHA256 = "{ssha256}";
	public static final String PASSWORD_SALT_SEP = ":";
	public static final String SPECIAL_GROUP_PREFIX = "_";
	public static final String GROUP_PUBLIC    = SPECIAL_GROUP_PREFIX+"public"; // all users even if they are not authenticated
	public static final String GROUP_CONNECTED = SPECIAL_GROUP_PREFIX+"connected"; // all authenticated users
	
	void loadIfNeccessary();
	boolean authenticate(String username, String password) throws MitsiUsersException;
	boolean isLdapEnabled();
	String getLdapUrl();
	String getLdapApplicationDN();
	String getLdapApplicationPassword();
	String getLdapUserDNPattern();
	String getLdapGroupSearchPattern();
	String getLdapGroupRoleAttribute();
	String getLdapMandatoryRole();
	Map<String, String[]> getGroups();
	SortedSet<String> getUserGrantedGroups(String username);
}
