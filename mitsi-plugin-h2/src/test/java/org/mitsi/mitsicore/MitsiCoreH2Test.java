package org.mitsi.mitsicore;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;
import java.util.TreeSet;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mitsi.api.datasources.*;
import org.mitsi.commons.MitsiException;
import org.mitsi.api.DatasourceManager;
import org.mitsi.datasources.DetailsSection;
import org.mitsi.datasources.MitsiConnection;
import org.mitsi.datasources.exceptions.MitsiDatasourceException;
import org.mitsi.datasources.helper.TypeHelper;
import org.mitsi.users.MitsiUsersException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

// TODO rajouter des test sur groupes _connected ou user-defined

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:spring/application-context.xml")
public class MitsiCoreH2Test {
	
	@Autowired
	private DatasourceManager datasourceManager;

	@Before
	public void beforeTest() {
		datasourceManager.loadIfNecessary();
	}

	@Test
	public void DatasourceManagerTest() throws IOException, MitsiUsersException, MitsiDatasourceException {
		try (MitsiConnection connection = datasourceManager.getConnection(null, true, "LOCALHOST-TEST")) {
			assertTrue(connection.testOK() != null);
		}
	}
	
	@Test
	public void getTables() throws IOException, ClassNotFoundException, SQLException, MitsiUsersException, MitsiDatasourceException {

		try(MitsiConnection connection = datasourceManager.getConnection(null, true, "LOCALHOST-TEST")) {
			List<DatabaseObject> ldo = connection.getTablesAndViews(null);
			assertTrue(ldo != null);
			assertTrue(ldo==null || ldo.size() > 0);
			
		}
	}
	
	@Test
	public void getIndexes() throws IOException, ClassNotFoundException, SQLException, MitsiUsersException, MitsiDatasourceException {

		
		try(MitsiConnection connection = datasourceManager.getConnection(null, true, "LOCALHOST-TEST")) {
			List<Index> li = connection.getSchemaIndexes(null);
			assertTrue(li != null);
			assertTrue(li==null || li.size() > 0);
			
		}
	}
	
	@Test
	public void getConstraints() throws IOException, ClassNotFoundException, SQLException, MitsiUsersException, MitsiDatasourceException {

		try(MitsiConnection connection = datasourceManager.getConnection(null, true, "LOCALHOST-TEST")) {
			List<Constraint> lc = connection.getSchemaConstraints(null);
			assertTrue(lc != null);
			assertTrue(lc==null || lc.size() > 0);
			
		}
	}

	@Test
	public void connectOnOtherSchema() throws IOException, ClassNotFoundException, SQLException, MitsiUsersException, MitsiDatasourceException {

		TreeSet<String> groups = new TreeSet<>();
		groups.add("xe2");
		try(MitsiConnection connection = datasourceManager.getConnection(groups, true, "LOCALHOST-MONSCHEMA")) {
			List<Schema> schemas = connection.getAllSchemas(null);
		}
	}
	
	@Test
	public void getAllSchema() throws IOException, ClassNotFoundException, SQLException, MitsiUsersException, MitsiDatasourceException {

		try(MitsiConnection connection = datasourceManager.getConnection(null, true, "LOCALHOST-TEST")) {
			
			List<Schema> schemas = connection.getAllSchemas(null);
			assertTrue(schemas.size() > 0);
			
		}
	}
	
	@Test
	public void getDetailsTable() throws IOException, ClassNotFoundException, SQLException, MitsiException {
		try(MitsiConnection connection = datasourceManager.getConnection(null, true, "LOCALHOST-TEST")) {
			List<DetailsSection> sections = connection.getDetailsForTable("TEST", "TOUTOU_1");
			
			assertNotNull(sections);
			assertEquals(sections.size(), 4);
			for(DetailsSection section : sections) {
				assertNotNull(section.title); 
				assertNotNull(section.columns); 
				assertTrue(section.columns.size() > 0); 
				assertNotNull(section.data); 
			}
			
		}
	}
		
	@Test
	public void getDetailsSource() throws IOException, ClassNotFoundException, SQLException, MitsiException {

		try(MitsiConnection connection = datasourceManager.getConnection(null, true, "LOCALHOST-TEST")) {
			List<DetailsSection> sections = connection.getDetailsForDatasource();
			
			assertNotNull(sections);
			assertEquals(sections.size(), 4);
			for(DetailsSection section : sections) {
				assertNotNull(section.title); 
				assertNotNull(section.columns); 
				assertTrue(section.columns.size() > 0); 
				assertNotNull(section.data); 
				//assertTrue(section.data.size() > 0);
			}
			
		}
	}
	
	@Test
	public void getData() throws SQLException, MitsiException {
		try(MitsiConnection connection = datasourceManager.getConnection(null, true, "LOCALHOST-TEST")) {
			GetDataResult result = connection.getData(null, "PLANET", 2, 2, null, null);
			assertEquals(result.columns.get(0).name, "ID");
			assertEquals(result.columns.get(1).name, "NAME");
			assertEquals(result.results.size(), 2);
			
			result = connection.getData("PUBLIC", "PLANET", 2, 2, null, null);
			assertEquals(result.columns.get(0).name, "ID");
			assertEquals(result.columns.get(1).name, "NAME");
			assertEquals(result.results.size(), 2);
			
			OrderByColumn[] orderByColumns = new OrderByColumn[2];
			OrderByColumn orderById  = new OrderByColumn();
			orderById.column = "ID";
			orderById.ascending = true;
			OrderByColumn orderByStr = new OrderByColumn();
			orderByStr.column = "NAME";
			orderByStr.ascending = false;
			orderByColumns[0] = orderById;
			orderByColumns[1] = orderByStr;
			result = connection.getData("PUBLIC", "PLANET", 2, 2, orderByColumns, null);
			assertEquals(result.columns.get(0).name, "ID");
			assertEquals(result.columns.get(1).name, "NAME");
			assertEquals(result.results.size(), 2);
			
			Filter filter1 = new Filter();
			filter1.name = "ID";
			filter1.filter = "2";
			filter1.type = TypeHelper.TYPE_INTEGER;
			Filter filter2 = new Filter();
			filter2.name = "NAME";
			filter2.filter = "Venus";
			Filter[] filters = new Filter[2];
			filters[0] = filter1;
			filters[1] = filter2;
			result = connection.getData("PUBLIC", "PLANET", 0, 2, null, filters);
			assertEquals(result.columns.get(0).name, "ID");
			assertEquals(result.columns.get(1).name, "NAME");
			assertEquals(result.results.size(), 1);
			
			result = connection.getData("PUBLIC", "PLANET", 0, 2, orderByColumns, filters);
			assertEquals(result.columns.get(0).name, "ID");
			assertEquals(result.columns.get(1).name, "NAME");
			assertEquals(result.results.size(), 1);

		}
	}
		
}
