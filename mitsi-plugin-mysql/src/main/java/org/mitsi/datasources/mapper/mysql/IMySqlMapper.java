package org.mitsi.datasources.mapper.mysql;

import static org.mitsi.api.annotations.ColumnDisplayType.FK_DIRECTION;
import static org.mitsi.api.annotations.ColumnDisplayType.NORMAL;
import static org.mitsi.api.annotations.ColumnDisplayType.TABLE_LINK;

import org.apache.ibatis.annotations.Param;
import org.mitsi.api.annotations.MitsiColumnDisplayTypes;
import org.mitsi.api.annotations.MitsiColumnTitles;
import org.mitsi.api.annotations.MitsiColumnsAsRows;
import org.mitsi.api.annotations.MitsiDatasourceDetail;
import org.mitsi.api.annotations.MitsiProviderMapper;
import org.mitsi.api.annotations.MitsiTableDetail;
import org.mitsi.api.datasources.IMitsiMapper;

@MitsiProviderMapper("mysql")
public interface IMySqlMapper extends IMitsiMapper {

	// table details
	@MitsiTableDetail(value="Miscellaneous", order=1)
	@MitsiColumnsAsRows(value={"Parameter", "Value"}, excludeColumns={"OWNER", "TABLE_NAME"})
	void getTableMiscellaneousDetails(@Param("owner") String owner, @Param("tableName") String tableName);
	
	@MitsiTableDetail(value="Columns", order=2)
	void getTableColumnsDetails(@Param("owner") String owner, @Param("tableName") String tableName);

	@MitsiTableDetail(value="Constraints", order=3)
	void getTableConstraintsDetails(@Param("owner") String owner, @Param("tableName") String tableName);
	
	@MitsiTableDetail(value="FK from/to this table", order=4)
	@MitsiColumnTitles(value={ "direction", "name", "linked table", "columns", "FK columns" })
	@MitsiColumnDisplayTypes(value={ FK_DIRECTION, NORMAL, TABLE_LINK })
	void getTableFks(@Param("owner") String owner, @Param("tableName") String tableName);

	@MitsiTableDetail(value="Indexs", order=5)
	void getTableIndexesDetails(@Param("owner") String owner, @Param("tableName") String tableName);

	@MitsiTableDetail(value="Partition", order=7)
	void getTablePartitionDetails(@Param("owner") String owner, @Param("tableName") String tableName);

	
	// datasource details

	@MitsiDatasourceDetail(value="Tables", order=1)
	void getTablesDetails();

	@MitsiDatasourceDetail(value="Views", order=2)
	void getViewsDetails();

	@MitsiDatasourceDetail(value="Schemas", order=4)
	void getSchemasDetails();

	@MitsiDatasourceDetail(value="Tablespaces", order=5)
	void getTablespaceDetails();
	
}
