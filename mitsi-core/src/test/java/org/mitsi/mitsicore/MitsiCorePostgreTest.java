package org.mitsi.mitsicore;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;
import java.util.TreeSet;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mitsi.commons.MitsiException;
import org.mitsi.commons.pojos.Filter;
import org.mitsi.commons.pojos.OrderByColumn;
import org.mitsi.core.DatasourceManager;
import org.mitsi.datasources.Column;
import org.mitsi.datasources.Constraint;
import org.mitsi.datasources.DatabaseObject;
import org.mitsi.datasources.Index;
import org.mitsi.datasources.MitsiConnection;
import org.mitsi.datasources.Partition;
import org.mitsi.datasources.Schema;
import org.mitsi.datasources.Sequence;
import org.mitsi.datasources.Tablespace;
import org.mitsi.datasources.exceptions.MitsiSecurityException;
import org.mitsi.datasources.helper.TypeHelper;
import org.mitsi.users.MitsiUsersException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

// TODO rajouter des test sur groupes _connected ou user-defined

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:spring/application-context.xml")
public class MitsiCorePostgreTest {
	
	@Autowired
	private DatasourceManager datasourceManager;

	@Before
	public void beforeTest() {
		datasourceManager.loadIfNeccessary();
	}

	@Test
	public void DatasourceManagerTest() throws IOException, MitsiUsersException {
		try (MitsiConnection connection = datasourceManager.getConnection(null, true, "POSTGRE-TEST")) {
			assertTrue(connection.testOK() != null);
		}
	}
	
	@Test
	public void getTables() throws IOException, ClassNotFoundException, SQLException, MitsiUsersException {

		try(MitsiConnection connection = datasourceManager.getConnection(null, true, "POSTGRE-TEST")) {
			List<DatabaseObject> ldo = connection.getTablesAndViews(null);
			assertTrue(ldo != null);
			assertTrue(ldo==null || ldo.size() > 0);
		}
	}
	
	@Test
	public void getIndexes() throws IOException, ClassNotFoundException, SQLException, MitsiUsersException {

		
		try(MitsiConnection connection = datasourceManager.getConnection(null, true, "POSTGRE-TEST")) {
			List<Index> li = connection.getSchemaIndexes(null);
			assertTrue(li != null);
			assertTrue(li==null || li.size() > 0);
			
		}
	}
	
	@Test
	public void getConstraints() throws IOException, ClassNotFoundException, SQLException, MitsiUsersException {

		try(MitsiConnection connection = datasourceManager.getConnection(null, true, "POSTGRE-TEST")) {
			List<Constraint> lc = connection.getSchemaConstraints(null);
			assertTrue(lc != null);
			assertTrue(lc==null || lc.size() > 0);
			
		}
	}

	@Test
	public void connectOnOtherSchema() throws IOException, ClassNotFoundException, SQLException, MitsiUsersException {

		TreeSet<String> groups = new TreeSet<>();
		groups.add("xe2");
		try(MitsiConnection connection = datasourceManager.getConnection(groups, true, "POSTGRE-TEST-ON-TEST2")) {
			List<Schema> schemas = connection.getAllSchemas(null);
		}
	}
	
	@Test
	public void getAllSchema() throws IOException, ClassNotFoundException, SQLException, MitsiUsersException {

		try(MitsiConnection connection = datasourceManager.getConnection(null, true, "POSTGRE-TEST")) {
			
			List<Schema> schemas = connection.getAllSchemas(null);
			assertTrue(schemas.size() > 0);
			
		}
	}
	
	@Test
	public void getDetailsTable() throws IOException, ClassNotFoundException, SQLException, MitsiUsersException {
		try(MitsiConnection connection = datasourceManager.getConnection(null, true, "POSTGRE-TEST")) {
			List<Column> lc = connection.getTableColumnsDetails("PUBLIC", "TUTU_1");
			assertTrue(lc != null);
			assertTrue(lc==null || lc.size() > 0);
			
			List<Column> lc2 = connection.getTablePartitioninKeysDetails("PUBLIC", "TUTU_1");
			assertTrue(lc2==null || lc2.size() == 0);

			List<Index> li = connection.getTableIndexesDetails("PUBLIC", "TUTU_1");
			assertTrue(li != null);
			assertTrue(li==null || li.size() > 0);
			
			List<Partition> lp = connection.getTablePartitionDetails("PUBLIC", "TUTU_1");
			assertTrue(lp==null || lp.size() == 0);
			
			List<Constraint> lct = connection.getTableConstraintsDetails("PUBLIC", "TUTU_1");
			assertTrue(lct != null);
			assertTrue(lct==null || lct.size() > 0);
			
			List<Constraint> lct2 = connection.getTableFks("PUBLIC", "MATABLE_DE_TEST");
			assertTrue(lct2 != null);
			assertTrue(lct2==null || lct2.size() > 0);
		}
	}
	
	@Test
	public void getDetailsSourcePostgre() throws IOException, ClassNotFoundException, SQLException, MitsiUsersException {

		try(MitsiConnection connection = datasourceManager.getConnection(null, true, "POSTGRE-TEST")) {
			List<DatabaseObject> ldo = connection.getTablesDetails();
			assertTrue(ldo != null);
			assertTrue(ldo==null || ldo.size() > 0);
			
			ldo = connection.getViewsDetails();
			assertTrue(ldo != null);
			assertTrue(ldo==null || ldo.size() > 0);
			
			ldo = connection.getMatViewsDetails();
			assertTrue(ldo != null);
			assertTrue(ldo==null || ldo.size() > 0);
			
			List<Schema> ls = connection.getSchemasDetails();
			assertTrue(ls != null);
			assertTrue(ls==null || ls.size() > 0);
			
			List<Tablespace> lt = connection.getTablespaceDetails();
			assertTrue(lt != null);
			assertTrue(lt==null || lt.size() > 0);
			
			List<Sequence> lsq = connection.getSequencesDetails();
			assertTrue(lsq != null);
			assertTrue(lsq==null || lsq.size() > 0);
		}
	}

	@Test
	public void getData() throws SQLException, MitsiException {
		try(MitsiConnection connection = datasourceManager.getConnection(null, true, "POSTGRE-TEST")) {
			MitsiConnection.GetDataResult result = connection.getData(null, "tata", 2, 2, null, null);
			assertEquals(result.columns.get(0).name, "id");
			assertEquals(result.columns.get(1).name, "str");
			assertEquals(result.results.size(), 2);
			
			result = connection.getData("public", "tata", 2, 2, null, null);
			assertEquals(result.columns.get(0).name, "id");
			assertEquals(result.columns.get(1).name, "str");
			assertEquals(result.results.size(), 2);
			
			OrderByColumn[] orderByColumns = new OrderByColumn[2];
			OrderByColumn orderById  = new OrderByColumn();
			orderById.column = "id";
			orderById.ascending = true;
			OrderByColumn orderByStr = new OrderByColumn();
			orderByStr.column = "str";
			orderByStr.ascending = false;
			orderByColumns[0] = orderById;
			orderByColumns[1] = orderByStr;
			result = connection.getData("public", "tata", 2, 2, orderByColumns, null);
			assertEquals(result.columns.get(0).name, "id");
			assertEquals(result.columns.get(1).name, "str");
			assertEquals(result.results.size(), 2);
			
			Filter filter1 = new Filter();
			filter1.name = "id";
			filter1.filter = "2";
			filter1.type = TypeHelper.TYPE_INTEGER;
			Filter filter2 = new Filter();
			filter2.name = "str";
			filter2.filter = "deux";
			Filter[] filters = new Filter[2];
			filters[0] = filter1;
			filters[1] = filter2;
			// TODO : tester les dates
			result = connection.getData("public", "tata", 0, 2, null, filters);
			assertEquals(result.columns.get(0).name, "id");
			assertEquals(result.columns.get(1).name, "str");
			assertEquals(result.results.size(), 1);
			
			result = connection.getData("public", "tata", 0, 2, orderByColumns, filters);
			assertEquals(result.columns.get(0).name, "id");
			assertEquals(result.columns.get(1).name, "str");
			assertEquals(result.results.size(), 1);

		}
	}
	
	
		
}
