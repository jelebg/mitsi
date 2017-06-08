package org.mitsi.datasources.mapper.oracle;

import java.util.List;


import org.apache.ibatis.annotations.Param;
import static org.mitsi.core.annotations.ColumnDisplayType.NORMAL;
import static org.mitsi.core.annotations.ColumnDisplayType.TABLE_LINK;
import static org.mitsi.core.annotations.ColumnDisplayType.FK_DIRECTION;
import org.mitsi.core.annotations.MitsiColumnDisplayTypes;
import org.mitsi.core.annotations.MitsiColumnTitles;
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

@MitsiProviderMapper("oracle_11g")
public interface IOracleMapper extends IMitsiMapper {

	// table details
	
	@MitsiTableDetail(value="Columns", order=1)
	@MitsiColumnTitles(value={ "", "", "", "", "", "Default value" })
	List<Column> getTableColumnsDetails(@Param("owner") String owner, @Param("tableName") String tableName);

	@MitsiTableDetail(value="Constraints", order=2)
	List<Constraint> getTableConstraintsDetails(@Param("owner") String owner, @Param("tableName") String tableName);
	
	@MitsiTableDetail(value="FK from/to this table", order=3)
	@MitsiColumnTitles(value={ "direction", "name", "columns", "FK table", "FK columns" })
	@MitsiColumnDisplayTypes(value={ FK_DIRECTION, NORMAL, NORMAL, TABLE_LINK })
	List<Constraint> getTableFks(@Param("owner") String owner, @Param("tableName") String tableName);

	@MitsiTableDetail(value="Indexs", order=4)
	List<Index> getTableIndexesDetails(@Param("owner") String owner, @Param("tableName") String tableName);

	@MitsiTableDetail(value="Partition Key", order=5)
	List<Column> getTablePartitioninKeysDetails(@Param("owner") String owner, @Param("tableName") String tableName);

	@MitsiTableDetail(value="Partition", order=6)
	List<Partition> getTablePartitionDetails(@Param("owner") String owner, @Param("tableName") String tableName);

	
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
