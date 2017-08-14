package org.mitsi.users;

import java.util.Map;

@SuppressWarnings("squid:ClassVariableVisibilityCheck")
public class MitsiUsersFile {
	public Map<String, String> users;
	public LdapAuthent ldapAuthent;
	public Map<String, String[]> groups;
	
	
	public class LdapAuthent {
		public String url;
		public String applicationDN;
		public String applicationPassword;
		public String userDNPattern;
		public String groupSearchPattern;
		public String groupRoleAttribute;
		public String mandatoryRole;
	}

}
