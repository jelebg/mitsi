package org.mitsi.datasources;

import java.sql.SQLException;
import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.mitsi.commons.MitsiException;
import org.mitsi.commons.pojos.Filter;
import org.mitsi.commons.pojos.OrderByColumn;
import org.mitsi.datasources.MitsiConnection.GetDataResult;


public interface IMitsiMapper {
	
	String testOK();
	
	List<Schema> getAllSchemas(@Param("owner") String owner);
	List<DatabaseObject> getTablesAndViews(@Param("owner") String owner);
	List<Index> getSchemaIndexes(@Param("owner") String owner);
	List<Constraint> getSchemaConstraints(@Param("owner") String owner);

	// for datasource details
	List<DatabaseObject> getTablesDetails();
	List<DatabaseObject> getViewsDetails();
	List<DatabaseObject> getMatViewsDetails();
	List<Schema>         getSchemasDetails();
	List<Tablespace>     getTablespaceDetails();
	List<Sequence>       getSequencesDetails();
	
	List<Column> getTableColumnsDetails(@Param("owner") String owner, @Param("name") String name);
	List<Column> getTablePartitioninKeysDetails(@Param("owner") String owner, @Param("name") String name);
	List<Index> getTableIndexesDetails(@Param("tableOwner") String tableOwner, @Param("tableName") String tableName);
	List<Partition> getTablePartitionDetails(@Param("tableOwner") String tableOwner, @Param("tableName") String tableName);
	List<Constraint> getTableConstraintsDetails(@Param("tableOwner") String tableOwner, @Param("tableName") String tableName);
	List<Constraint> getTableFks(@Param("tableOwner") String tableOwner, @Param("tableName") String tableName);
	
	GetDataResult getData(
			@Param("owner") String owner, 
			@Param("tableName") String tableName, 
			@Param("fromRow") long fromRow, 
			@Param("count") long count, 
			@Param("orderByColumns") OrderByColumn[] orderByColumns, 
			@Param("filters") Filter[] filters) throws SQLException, MitsiException;
	
}
