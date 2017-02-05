package org.mitsi.mitsiwar.data;

import org.mitsi.commons.pojos.OrderByColumn;

public class GetData {
	String datasourceName;
	String owner;
	String objectName;
	String table;
	OrderByColumn[] orderByColumns;
	long fromRow;
	long count;
	
	public GetData() {
	}
}
