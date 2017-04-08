package org.mitsi.commons;

import java.lang.Exception;

public class MitsiException extends Exception {
	private static final long serialVersionUID = 1L;
	
	public MitsiException() {
		super();		
	}
	
	public MitsiException(String message) {
		super(message);
	}
	
	public MitsiException(String message, Exception e) {
		super(message, e);
	}

}
