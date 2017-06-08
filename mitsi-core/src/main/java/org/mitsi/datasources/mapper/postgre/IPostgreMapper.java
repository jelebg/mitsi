package org.mitsi.datasources.mapper.postgre;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.mitsi.core.annotations.DefaultOwner;
import org.mitsi.core.annotations.MitsiDatasourceDetail;
import org.mitsi.core.annotations.MitsiProviderMapper;
import org.mitsi.core.annotations.MitsiTableDetail;
import org.mitsi.datasources.Column;
import org.mitsi.datasources.Constraint;
import org.mitsi.datasources.DatabaseObject;
import org.mitsi.datasources.IMitsiMapper;
import org.mitsi.datasources.Index;
import org.mitsi.datasources.Partition;
import org.mitsi.datasources.Schema;
import org.mitsi.datasources.Sequence;
import org.mitsi.datasources.Tablespace;

@MitsiProviderMapper("postgre")
@DefaultOwner("public")
public interface IPostgreMapper extends IMitsiMapper {

	// table details

	@MitsiTableDetail(value="Columns", order=1)
	List<Column> getTableColumnsDetails(@Param("owner") String owner, @Param("tableName") String tableName);

	@MitsiTableDetail(value="Indexs", order=2)
	List<Index> getTableIndexesDetails(@Param("owner") String owner, @Param("tableName") String tableName);

	@MitsiTableDetail(value="Constraints", order=3)
	List<Constraint> getTableConstraintsDetails(@Param("owner") String owner, @Param("tableName") String tableName);

	@MitsiTableDetail(value="Foreign Keys", order=4)
	List<Constraint> getTableFks(@Param("owner") String owner, @Param("tableName") String tableName);

	// datasource details

	@MitsiDatasourceDetail(value="Tables", order=1)
	List<DatabaseObject> getTablesDetails();

	@MitsiDatasourceDetail(value="Views", order=2)
	List<DatabaseObject> getViewsDetails();

	@MitsiDatasourceDetail(value="Materialized views", order=3)
	List<DatabaseObject> getMatViewsDetails();

	@MitsiDatasourceDetail(value="Schemas", order=4)
	List<Schema>         getSchemasDetails();

	@MitsiDatasourceDetail(value="Tablespaces", order=5)
	List<Tablespace>     getTablespaceDetails();

	@MitsiDatasourceDetail(value="Sequences", order=6)
	List<Sequence>       getSequencesDetails();
}
