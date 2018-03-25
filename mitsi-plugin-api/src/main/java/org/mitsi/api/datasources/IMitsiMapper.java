package org.mitsi.api.datasources;

import java.sql.SQLException;
import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.mitsi.commons.MitsiException;

public interface IMitsiMapper {
	
	String testOK();
	
	List<Schema> getAllSchemas(@Param("owner") String owner);
	List<DatabaseObject> getTablesAndViews(@Param("owner") String owner);
	List<Index> getSchemaIndexes(@Param("owner") String owner);
	List<Constraint> getSchemaConstraints(@Param("owner") String owner);

	GetDataResult getData(
			@Param("owner") String owner, 
			@Param("tableName") String tableName, 
			@Param("fromRow") long fromRow, 
			@Param("count") long count, 
			@Param("orderByColumns") OrderByColumn[] orderByColumns, 
			@Param("filters") Filter[] filters) throws SQLException, MitsiException;
	
}
