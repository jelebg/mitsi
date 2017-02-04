package org.mitsi.datasources;

import java.util.List;

public class Relation {
	String tableName;
	String tableOwner;
	List<String> keyColumns;
	String keyColumnsStr;
	
	String rTableName;
	String rTableOwner;
	List<String> rKeyColumns;
	String rKeyColumnsStr;
}
