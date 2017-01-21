package org.mitsi.users;

public class MitsiUsersException extends Exception{
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
