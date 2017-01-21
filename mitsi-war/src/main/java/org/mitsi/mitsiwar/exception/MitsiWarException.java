package org.mitsi.mitsiwar.exception;

public class MitsiWarException extends Exception {
	private static final long serialVersionUID = 1L;

	public MitsiWarException() {
	}
	
	public MitsiWarException(String message) {
		super(message);
	}
	
	public MitsiWarException(String message, Exception e) {
		super(message, e);
	}
}
