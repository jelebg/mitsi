package org.mitsi.datasources.mapper.h2;

import static org.mitsi.api.annotations.ColumnDisplayType.FK_DIRECTION;
import static org.mitsi.api.annotations.ColumnDisplayType.NORMAL;
import static org.mitsi.api.annotations.ColumnDisplayType.TABLE_LINK;

import org.apache.ibatis.annotations.Param;
import org.mitsi.api.annotations.DefaultOwner;
import org.mitsi.api.annotations.MitsiColumnDisplayTypes;
import org.mitsi.api.annotations.MitsiColumnTitles;
import org.mitsi.api.annotations.MitsiColumnsAsRows;
import org.mitsi.api.annotations.MitsiDatasourceDetail;
import org.mitsi.api.annotations.MitsiProviderMapper;
import org.mitsi.api.annotations.MitsiTableDetail;
import org.mitsi.api.datasources.IMitsiMapper;

@MitsiProviderMapper("h2")
@DefaultOwner("PUBLIC")
public interface IH2Mapper extends IMitsiMapper {

	// table details
	@MitsiTableDetail(value="Miscellaneous", order=1)
	@MitsiColumnsAsRows(value={"Parameter", "Value"}, excludeColumns={"OWNER", "TABLE_NAME"})
	void getTableMiscellaneousDetails(@Param("owner") String owner, @Param("tableName") String tableName);
	
	@MitsiTableDetail(value="Columns", order=2)
	@MitsiColumnTitles(value={ "", "", "", "", "", "Default value" })
	void getTableColumnsDetails(@Param("owner") String owner, @Param("tableName") String tableName);

	@MitsiTableDetail(value="Constraints", order=3)
	void getTableConstraintsDetails(@Param("owner") String owner, @Param("tableName") String tableName);
	
	@MitsiTableDetail(value="Indexs", order=5)
	void getTableIndexesDetails(@Param("owner") String owner, @Param("tableName") String tableName);

	// datasource details

	@MitsiDatasourceDetail(value="Tables", order=1)
	void getTablesDetails();

	@MitsiDatasourceDetail(value="Views", order=2)
	void getViewsDetails();

	@MitsiDatasourceDetail(value="Schemas", order=4)
	void getSchemasDetails();

	@MitsiDatasourceDetail(value="Sequences", order=6)
	void getSequencesDetails();
	
}
