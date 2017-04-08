package org.mitsi.users;

import org.mitsi.commons.MitsiException;

public class MitsiUsersException extends MitsiException{
	private static final long serialVersionUID = 1L;

	public MitsiUsersException() {
		super();		
	}
	
	public MitsiUsersException(String message) {
		super(message);
	}
	
	public MitsiUsersException(String message, Exception e) {
		super(message, e);
	}
}
