package org.mitsi.datasources.mapper.postgre;

import org.apache.ibatis.annotations.Param;
import org.mitsi.core.annotations.DefaultOwner;
import org.mitsi.core.annotations.MitsiDatasourceDetail;
import org.mitsi.core.annotations.MitsiProviderMapper;
import org.mitsi.core.annotations.MitsiTableDetail;
import org.mitsi.datasources.IMitsiMapper;

@MitsiProviderMapper("postgre")
@DefaultOwner("public")
public interface IPostgreMapper extends IMitsiMapper {

	// table details

	@MitsiTableDetail(value="Columns", order=1)
	void getTableColumnsDetails(@Param("owner") String owner, @Param("tableName") String tableName);

	@MitsiTableDetail(value="Indexs", order=2)
	void getTableIndexesDetails(@Param("owner") String owner, @Param("tableName") String tableName);

	@MitsiTableDetail(value="Constraints", order=3)
	void getTableConstraintsDetails(@Param("owner") String owner, @Param("tableName") String tableName);

	@MitsiTableDetail(value="Foreign Keys", order=4)
	// TODO : link pour la colonne des tables
	void getTableFks(@Param("owner") String owner, @Param("tableName") String tableName);

	// datasource details

	@MitsiDatasourceDetail(value="Tables", order=1)
	void getTablesDetails();

	@MitsiDatasourceDetail(value="Views", order=2)
	void getViewsDetails();

	@MitsiDatasourceDetail(value="Materialized views", order=3)
	void getMatViewsDetails();

	@MitsiDatasourceDetail(value="Schemas", order=4)
	void getSchemasDetails();

	@MitsiDatasourceDetail(value="Tablespaces", order=5)
	void getTablespaceDetails();

	@MitsiDatasourceDetail(value="Sequences", order=6)
	void getSequencesDetails();
}
