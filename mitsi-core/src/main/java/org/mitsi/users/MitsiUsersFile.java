package org.mitsi.users;

import java.util.Map;

@SuppressWarnings("squid:ClassVariableVisibilityCheck")
public class MitsiUsersFile {
	public Map<String, String> users;
	public LdapAuthent ldapAuthent;
	public Map<String, String[]> groups;
	
	
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
