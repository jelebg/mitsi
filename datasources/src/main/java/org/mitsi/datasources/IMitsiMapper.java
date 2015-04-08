package org.mitsi.datasources;

import java.util.List;

import org.apache.ibatis.annotations.Param;


public interface IMitsiMapper {

	String testOK();
	void changeSchema(@Param("schema") String schema);
	List<Schema> getAllSchemas();
	List<DatabaseObject> getTablesAndViews(@Param("owner") String owner);

	// for datasource details
	List<DatabaseObject> getTablesDetails();
	List<DatabaseObject> getViewsDetails();
	List<DatabaseObject> getMatViewsDetails();
	List<Schema> getSchemasDetails();
	List<Tablespace> getTablespaceDetails();
	List<Column> getTableColumnsDetails(@Param("owner") String owner, @Param("name") String name);
	List<Index> getTableIndexesDetails(@Param("tableOwner") String tableOwner, @Param("tableName") String tableName);
	List<Partition> getTablePartitionDetails(@Param("tableOwner") String tableOwner, @Param("tableName") String tableName);
	List<Constraint> getTableConstraintsDetails(@Param("tableOwner") String tableOwner, @Param("tableName") String tableName);
	
	
}
