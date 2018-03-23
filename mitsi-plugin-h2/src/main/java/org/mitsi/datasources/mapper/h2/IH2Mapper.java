package org.mitsi.datasources.mapper.h2;

import static org.mitsi.core.annotations.ColumnDisplayType.FK_DIRECTION;
import static org.mitsi.core.annotations.ColumnDisplayType.NORMAL;
import static org.mitsi.core.annotations.ColumnDisplayType.TABLE_LINK;

import org.apache.ibatis.annotations.Param;
import org.mitsi.core.annotations.DefaultOwner;
import org.mitsi.core.annotations.MitsiColumnDisplayTypes;
import org.mitsi.core.annotations.MitsiColumnTitles;
import org.mitsi.core.annotations.MitsiColumnsAsRows;
import org.mitsi.core.annotations.MitsiDatasourceDetail;
import org.mitsi.core.annotations.MitsiProviderMapper;
import org.mitsi.core.annotations.MitsiTableDetail;
import org.mitsi.datasources.IMitsiMapper;

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
