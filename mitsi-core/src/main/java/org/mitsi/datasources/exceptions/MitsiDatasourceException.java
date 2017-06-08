package org.mitsi.datasources.exceptions;

import org.mitsi.commons.MitsiException;

public class MitsiDatasourceException extends MitsiException {

	public MitsiDatasourceException(String string) {
		super(string);
	}
	public MitsiDatasourceException(String string, Exception e) {
		super(string, e);
	}

	private static final long serialVersionUID = 1L;

}
