package org.mitsi.mitsiwar.authent;

import org.mitsi.users.MitsiUsersException;

public interface MitsiAuthenticator {

	boolean authenticate(String username, String password) throws MitsiUsersException ;
	
}
