package org.mitsi.mitsicore;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Date;
import java.util.List;
import java.util.TreeSet;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mitsi.commons.pojos.OrderByColumn;
import org.mitsi.core.DatasourceManager;
import org.mitsi.datasources.Constraint;
import org.mitsi.datasources.DatabaseObject;
import org.mitsi.datasources.Index;
import org.mitsi.datasources.MitsiConnection;
import org.mitsi.datasources.Relation;
import org.mitsi.datasources.Schema;
import org.mitsi.datasources.Tablespace;
import org.mitsi.datasources.exceptions.MitsiSecurityException;
import org.mitsi.users.MitsiUsersException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.mitsi.commons.pojos.Filter;

// TODO rajouter des test sur groupes _connected ou user-defined

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:spring/application-context.xml")
public class MitsiCoreTest {
	
	@Autowired
	private DatasourceManager datasourceManager;

	@Before
	public void beforeTest() {
		datasourceManager.loadIfNeccessary();
	}

	@Test
	public void DatasourceManagerTest() throws IOException, MitsiUsersException {
		try (MitsiConnection connection = datasourceManager.getConnection(null, true, "LOCALHOST-TEST")) {
			assertTrue(connection.testOK() != null);
		}
	}
	
	@Test
	public void getTables() throws IOException, ClassNotFoundException, SQLException, MitsiUsersException {

		try(MitsiConnection connection = datasourceManager.getConnection(null, true, "LOCALHOST-TEST")) {
			List<DatabaseObject> ldo = connection.getTablesAndViews(null);
			assertTrue(ldo != null);
			assertTrue(ldo==null || ldo.size() > 0);
			
			List<Date> ld = connection.getLastSchemaUpdateTime("TEST");
			assertTrue(ld != null);
			assertTrue(ld==null || ld.size() == 1);

			
		}
	}
	
	@Test
	public void getTablesLight() throws IOException, ClassNotFoundException, SQLException, MitsiUsersException {

		try(MitsiConnection connection = datasourceManager.getConnection(null, true, "LOCALHOST-TEST")) {
			List<DatabaseObject> ldo = connection.getTablesAndViewsLight(null);
			assertTrue(ldo != null);
			assertTrue(ldo==null || ldo.size() > 0);
		
		}
	}
	
	@Test
	public void getIndexes() throws IOException, ClassNotFoundException, SQLException, MitsiUsersException {

		
		try(MitsiConnection connection = datasourceManager.getConnection(null, true, "LOCALHOST-TEST")) {
			List<Index> li = connection.getSchemaIndexes(null);
			assertTrue(li != null);
			assertTrue(li==null || li.size() > 0);
			
		}
	}
	
	@Test
	public void getConstraints() throws IOException, ClassNotFoundException, SQLException, MitsiUsersException {

		try(MitsiConnection connection = datasourceManager.getConnection(null, true, "LOCALHOST-TEST")) {
			List<Constraint> lc = connection.getSchemaConstraints(null);
			assertTrue(lc != null);
			assertTrue(lc==null || lc.size() > 0);
			
		}
	}

	@Test
	public void changeSchema() throws IOException, ClassNotFoundException, SQLException, MitsiUsersException {

		try(MitsiConnection connection = datasourceManager.getConnection(null, true, "LOCALHOST-TEST")) {
			connection.changeSchema("XE2");

		}
	}
	
	@Test
	public void connectOnOtherSchema() throws IOException, ClassNotFoundException, SQLException, MitsiUsersException {

		TreeSet<String> groups = new TreeSet<>();
		groups.add("xe2");
		try(MitsiConnection connection = datasourceManager.getConnection(groups, true, "LOCALHOST-XE2-ON-TEST")) {
			List<Schema> schemas = connection.getAllSchemas();
			Schema currentSchema = null;
			for(Schema schema : schemas) {
				if(schema.current==true) {
					currentSchema = schema;
					break;
				}
			}
			assertEquals(currentSchema.name, "TEST");
		}
	}
	
	@Test
	public void getAllSchema() throws IOException, ClassNotFoundException, SQLException, MitsiUsersException {

		try(MitsiConnection connection = datasourceManager.getConnection(null, true, "LOCALHOST-TEST")) {
			
			List<Schema> schemas = connection.getAllSchemas();
			assertTrue(schemas.size() > 0);
			
		}
	}
	
	@Test
	public void getDetailsTables() throws IOException, ClassNotFoundException, SQLException, MitsiUsersException {

		try(MitsiConnection connection = datasourceManager.getConnection(null, true, "LOCALHOST-TEST")) {
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
		}
	}
	
	@Test
	public void getAllRelations() throws IOException, ClassNotFoundException, SQLException, MitsiUsersException {
		try(MitsiConnection connection = datasourceManager.getConnection(null, true, "LOCALHOST-TEST")) {
			List<Relation> lr = connection.getAllRelations();
			assertTrue(lr != null);
			assertTrue(lr==null || lr.size() > 0);
		}		
	}
	
	@Test
	public void getData() throws SQLException, MitsiSecurityException, MitsiUsersException {
		try(MitsiConnection connection = datasourceManager.getConnection(null, true, "LOCALHOST-TEST")) {
			MitsiConnection.GetDataResult result = connection.getData(null, "TATA", 2, 2, null, null);
			assertEquals(result.columns.get(0).name, "ID");
			assertEquals(result.columns.get(1).name, "STR");
			assertEquals(result.results.size(), 2);
			
			result = connection.getData("TEST", "TATA", 2, 2, null, null);
			assertEquals(result.columns.get(0).name, "ID");
			assertEquals(result.columns.get(1).name, "STR");
			assertEquals(result.results.size(), 2);
			
			OrderByColumn[] orderByColumns = new OrderByColumn[2];
			OrderByColumn orderById  = new OrderByColumn();
			orderById.column = "ID";
			orderById.ascending = true;
			OrderByColumn orderByStr = new OrderByColumn();
			orderByStr.column = "STR";
			orderByStr.ascending = false;
			orderByColumns[0] = orderById;
			orderByColumns[1] = orderByStr;
			result = connection.getData("TEST", "TATA", 2, 2, orderByColumns, null);
			assertEquals(result.columns.get(0).name, "ID");
			assertEquals(result.columns.get(1).name, "STR");
			assertEquals(result.results.size(), 2);
			
			Filter filter1 = new Filter();
			filter1.name = "ID";
			filter1.filter = "2";
			Filter filter2 = new Filter();
			filter2.name = "STR";
			filter2.filter = "deux";
			Filter[] filters = new Filter[2];
			filters[0] = filter1;
			filters[1] = filter2;
			result = connection.getData("TEST", "TATA", 0, 2, null, filters);
			assertEquals(result.columns.get(0).name, "ID");
			assertEquals(result.columns.get(1).name, "STR");
			assertEquals(result.results.size(), 1);
			
			result = connection.getData("TEST", "TATA", 0, 2, orderByColumns, filters);
			assertEquals(result.columns.get(0).name, "ID");
			assertEquals(result.columns.get(1).name, "STR");
			assertEquals(result.results.size(), 1);

		}
	}
	
	
		
}
