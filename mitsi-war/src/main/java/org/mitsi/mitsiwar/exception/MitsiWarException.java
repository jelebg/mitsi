package org.mitsi.mitsiwar.exception;

import org.mitsi.commons.MitsiException;

public class MitsiWarException extends MitsiException {
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
