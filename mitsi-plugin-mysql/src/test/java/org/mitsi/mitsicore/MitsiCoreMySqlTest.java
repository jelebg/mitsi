package org.mitsi.mitsicore;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mitsi.commons.MitsiException;
import org.mitsi.commons.pojos.Filter;
import org.mitsi.commons.pojos.OrderByColumn;
import org.mitsi.core.DatasourceManager;
import org.mitsi.datasources.Constraint;
import org.mitsi.datasources.DatabaseObject;
import org.mitsi.datasources.DetailsSection;
import org.mitsi.datasources.Index;
import org.mitsi.datasources.MitsiConnection;
import org.mitsi.datasources.MitsiConnection.GetDataResult;
import org.mitsi.datasources.Schema;
import org.mitsi.datasources.exceptions.MitsiDatasourceException;
import org.mitsi.datasources.exceptions.MitsiSecurityException;
import org.mitsi.datasources.helper.TypeHelper;
import org.mitsi.users.MitsiUsersException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:spring/application-context.xml")
public class MitsiCoreMySqlTest {
	
	public static final String DATASOURCE_NAME = "BUBULLE-MYSQL";
	public static final String DATASOURCE_NAME_2 = "BUBULLE-MYSQL-ON-TEST";
	public static final String DATASOURCE_NAME_OTHER_SCHEMA = "BUBULLE-MYSQL-ON-TEST2";
	
	@Autowired
	private DatasourceManager datasourceManager;

	@Before
	public void beforeTest() {
		datasourceManager.loadIfNecessary();
	}

	@Test
	public void datasourceManagerTest() throws IOException, MitsiUsersException, MitsiDatasourceException {
		try (MitsiConnection connection = datasourceManager.getConnection(null, true, DATASOURCE_NAME)) {
			assertTrue(connection.testOK() != null);
		}
	}
	
	@Test
	public void getTables() throws IOException, ClassNotFoundException, SQLException, MitsiUsersException, MitsiDatasourceException {

		try(MitsiConnection connection = datasourceManager.getConnection(null, true, DATASOURCE_NAME)) {
			List<DatabaseObject> ldo = connection.getTablesAndViews("test");
			assertTrue(ldo != null);
			assertTrue(ldo==null || ldo.size() > 0);
			
		}
	}
	
	@Test
	public void getIndexes() throws IOException, ClassNotFoundException, SQLException, MitsiUsersException, MitsiDatasourceException {

		
		try(MitsiConnection connection = datasourceManager.getConnection(null, true, DATASOURCE_NAME)) {
			List<Index> li = connection.getSchemaIndexes("test");
			assertTrue(li != null);
			assertTrue(li==null || li.size() > 0);
			
		}
	}
	
	@Test
	public void getConstraints() throws IOException, ClassNotFoundException, SQLException, MitsiUsersException, MitsiDatasourceException {

		try(MitsiConnection connection = datasourceManager.getConnection(null, true, DATASOURCE_NAME)) {
			List<Constraint> lc = connection.getSchemaConstraints("test");
			assertTrue(lc != null);
			assertTrue(lc==null || lc.size() > 0);
			
		}
	}

	@Test
	public void connectOnOtherSchema() throws IOException, ClassNotFoundException, SQLException, MitsiUsersException, MitsiDatasourceException {

		try(MitsiConnection connection = datasourceManager.getConnection(null, true, DATASOURCE_NAME_OTHER_SCHEMA)) {
			List<Schema> schemas = connection.getAllSchemas(null);
		}
	}
	
	@Test
	public void getAllSchema() throws IOException, ClassNotFoundException, SQLException, MitsiUsersException, MitsiDatasourceException {

		try(MitsiConnection connection = datasourceManager.getConnection(null, true, DATASOURCE_NAME)) {
			
			List<Schema> schemas = connection.getAllSchemas(null);
			assertTrue(schemas.size() > 0);
			
		}
	}
	
	@Test
	public void getDetailsTable() throws IOException, ClassNotFoundException, SQLException, MitsiException {
		try(MitsiConnection connection = datasourceManager.getConnection(null, true, DATASOURCE_NAME)) {
			List<DetailsSection> sections = connection.getDetailsForTable("TEST", "TOUTOU_1");
			
			assertNotNull(sections);
			assertEquals(sections.size(), 6);
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

		try(MitsiConnection connection = datasourceManager.getConnection(null, true, DATASOURCE_NAME)) {
			List<DetailsSection> sections = connection.getDetailsForDatasource();
			
			assertNotNull(sections);
			assertEquals(sections.size(), 4);
			for(DetailsSection section : sections) {
				assertNotNull(section.title); 
				assertNotNull(section.columns); 
				assertTrue(section.columns.size() > 0); 
				assertNotNull(section.data); 
				assertTrue(section.title.equals("Tablespaces") || section.data.size() > 0); 
			}
			
		}
	}
	
	@Test
	public void getData() throws SQLException, MitsiException {
		try(MitsiConnection connection = datasourceManager.getConnection(null, true, DATASOURCE_NAME_2)) {
			MitsiConnection.GetDataResult result = connection.getData(null, "tata", 2, 2, null, null);
			assertEquals(result.columns.get(0).name, "id");
			assertEquals(result.columns.get(1).name, "str");
			assertEquals(result.results.size(), 2);
			
			result = connection.getData("test", "tata", 2, 2, null, null);
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
			result = connection.getData("test", "tata", 2, 2, orderByColumns, null);
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
			result = connection.getData("test", "tata", 0, 2, null, filters);
			assertEquals(result.columns.get(0).name, "id");
			assertEquals(result.columns.get(1).name, "str");
			assertEquals(result.results.size(), 1);
			
			result = connection.getData("test", "tata", 0, 2, orderByColumns, filters);
			assertEquals(result.columns.get(0).name, "id");
			assertEquals(result.columns.get(1).name, "str");
			assertEquals(result.results.size(), 1);

		}
	}
	
	@Test
	public void runSql() throws IOException, ClassNotFoundException, SQLException, MitsiException {
		try (MitsiConnection connection = datasourceManager.getConnection(null, true, DATASOURCE_NAME)) {
			GetDataResult result = connection.runSql("select 1 from dual", 1, null, null, null);
			assertEquals(result.columns.size(), 1);
			assertEquals(result.results.size(), 1);
		}
	}
	
	@Test(expected=MitsiException.class)
	public void runSqlError() throws IOException, ClassNotFoundException, SQLException, MitsiException {
		try (MitsiConnection connection = datasourceManager.getConnection(null, true, DATASOURCE_NAME)) {
			connection.runSql("my mistake", 1, null, null, null);
		}
	}

	@Test(expected= MitsiSecurityException.class)
	public void runSqlRestrictedUpdate() throws IOException, ClassNotFoundException, SQLException, MitsiException {
		try (MitsiConnection connection = datasourceManager.getConnection(null, true, DATASOURCE_NAME)) {
			connection.runSql("update tutu set id = 1", 1, null, null, null);
		}
	}

}
