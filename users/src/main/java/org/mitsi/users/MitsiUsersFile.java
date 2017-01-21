package org.mitsi.users;

import java.util.HashMap;

public class MitsiUsersFile {
	public HashMap<String, String> users;
	public LdapAuthent ldapAuthent;
	public HashMap<String, String[]> groups;
	
	
	class 	LdapAuthent {
		String url;
		String applicationDN;
		String applicationPassword;
		String userDNPattern;
		String groupSearchPattern;
		String groupRoleAttribute;
		String mandatoryRole;
	}

}
