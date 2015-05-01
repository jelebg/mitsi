package org.mitsi.test.users;

import static org.junit.Assert.*;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Date;
import java.util.List;

import org.json.simple.parser.ParseException;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mitsi.datasources.Column;
import org.mitsi.datasources.Constraint;
import org.mitsi.datasources.DatabaseObject;
import org.mitsi.datasources.Index;
import org.mitsi.datasources.MitsiConnection;
import org.mitsi.datasources.Relation;
import org.mitsi.datasources.Schema;
import org.mitsi.datasources.Tablespace;
import org.mitsi.datasources.exceptions.MitsiDatasourceException;
import org.mitsi.users.PublicDatasources;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:spring/application-context.xml")
public class PublicDatasourcesTest {

	// TODO : a remplacer par du spring
	//private String getTestRoot() {
	//	return getClass().getResource("/").getPath();
	//}
	
	@Autowired
	private PublicDatasources publicDatasources;
	
	@Test
	public void test() throws IOException, ParseException, ClassNotFoundException, SQLException {

		//System.out.println("Working Directory = "
		//		+ System.getProperty("user.dir"));

		assertEquals(publicDatasources.getDatasource("LOCALHOST-TEST").getName(), "LOCALHOST-TEST");
		
		try(MitsiConnection connection = new MitsiConnection(publicDatasources.getDatasource("LOCALHOST-TEST"))) {
			connection.connect();
			connection.testOK();
		}
	}

	@Test
	public void getTables() throws IOException, ParseException, ClassNotFoundException, SQLException {

		assertEquals(publicDatasources.getDatasource("LOCALHOST-TEST").getName(), "LOCALHOST-TEST");
		
		try(MitsiConnection connection = new MitsiConnection(publicDatasources.getDatasource("LOCALHOST-TEST"))) {
			connection.connect();
			List<DatabaseObject> ldo = connection.getTablesAndViews(null);
			assertTrue(ldo != null);
			assertTrue(ldo==null || ldo.size() > 0);
			
			List<Date> ld = connection.getLastSchemaUpdateTime("TEST");
			assertTrue(ld != null);
			assertTrue(ld==null || ld.size() == 1);

			
		}
	}
	
	@Test
	public void getIndexes() throws IOException, ParseException, ClassNotFoundException, SQLException {

		assertEquals(publicDatasources.getDatasource("LOCALHOST-TEST").getName(), "LOCALHOST-TEST");
		
		try(MitsiConnection connection = new MitsiConnection(publicDatasources.getDatasource("LOCALHOST-TEST"))) {
			connection.connect();
			List<Index> li = connection.getSchemaIndexes(null);
			assertTrue(li != null);
			assertTrue(li==null || li.size() > 0);
			
		}
	}
	
	@Test
	public void getConstraints() throws IOException, ParseException, ClassNotFoundException, SQLException {

		assertEquals(publicDatasources.getDatasource("LOCALHOST-TEST").getName(), "LOCALHOST-TEST");
		
		try(MitsiConnection connection = new MitsiConnection(publicDatasources.getDatasource("LOCALHOST-TEST"))) {
			connection.connect();
			List<Constraint> lc = connection.getSchemaConstraints(null);
			assertTrue(lc != null);
			assertTrue(lc==null || lc.size() > 0);
			
		}
	}

	@Test
	public void changeSchema() throws IOException, ParseException, ClassNotFoundException, SQLException, MitsiDatasourceException {

		assertEquals(publicDatasources.getDatasource("LOCALHOST-TEST").getName(), "LOCALHOST-TEST");
		
		try(MitsiConnection connection = new MitsiConnection(publicDatasources.getDatasource("LOCALHOST-TEST"))) {
			connection.connect();
			connection.changeSchema("XE2");
			List<Column> columns = connection.rawSelectBegin("select count(*) cnt from mytable_xe2");
			assertTrue(columns.size()==1);
			assertTrue("CNT".equals(columns.get(0).name));
			List<String[]> results = connection.rawSelectFetch(1);
			assertTrue(results.size()==1);
			assertTrue(results.get(0).length==1);

			connection.rawSelectEnd();
		}
	}
	
	@Test
	public void connectOnOtherSchema() throws IOException, ParseException, ClassNotFoundException, SQLException, MitsiDatasourceException {

		try(MitsiConnection connection = new MitsiConnection(publicDatasources.getDatasource("LOCALHOST-XE2-ON-TEST"))) {
			connection.connect();
			List<Column> columns = connection.rawSelectBegin("select count(*) cnt from tata");
			assertTrue(columns.size()==1);
			assertTrue("CNT".equals(columns.get(0).name));
			List<String[]> results = connection.rawSelectFetch(1);
			assertTrue(results.size()==1);
			assertTrue(results.get(0).length==1);

			connection.rawSelectEnd();
		}
	}
	
	@Test
	public void getAllSchema() throws IOException, ParseException, ClassNotFoundException, SQLException, MitsiDatasourceException {

		try(MitsiConnection connection = new MitsiConnection(publicDatasources.getDatasource("LOCALHOST-TEST"))) {
			
			connection.connect();
			List<Schema> schemas = connection.getAllSchemas();
			assertTrue(schemas.size() > 0);
			
		}
	}
	
	@Test
	public void getDetailsTables() throws IOException, ParseException, ClassNotFoundException, SQLException {

		assertEquals(publicDatasources.getDatasource("LOCALHOST-TEST").getName(), "LOCALHOST-TEST");
		
		try(MitsiConnection connection = new MitsiConnection(publicDatasources.getDatasource("LOCALHOST-TEST"))) {
			connection.connect();
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
	public void getAllRelations() throws IOException, ParseException, ClassNotFoundException, SQLException {
		try(MitsiConnection connection = new MitsiConnection(publicDatasources.getDatasource("LOCALHOST-TEST"))) {
			connection.connect();
			List<Relation> lr = connection.getAllRelations();
			assertTrue(lr != null);
			assertTrue(lr==null || lr.size() > 0);
		}		
	}

}
