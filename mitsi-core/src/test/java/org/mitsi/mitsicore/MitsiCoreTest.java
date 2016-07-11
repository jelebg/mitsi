package org.mitsi.mitsicore;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Date;
import java.util.List;

import org.json.simple.parser.ParseException;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mitsi.core.DatasourceManager;
import org.mitsi.datasources.Constraint;
import org.mitsi.datasources.DatabaseObject;
import org.mitsi.datasources.Index;
import org.mitsi.datasources.MitsiConnection;
import org.mitsi.datasources.Relation;
import org.mitsi.datasources.Schema;
import org.mitsi.datasources.Tablespace;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:spring/application-context.xml")
public class MitsiCoreTest {
	
	//@Autowired
	//private PublicDatasources publicDatasources;

	@Autowired
	private DatasourceManager datasourceManager;


	@Test
	public void DatasourceManagerTest() throws IOException {
		try (MitsiConnection connection = datasourceManager.getConnection("LOCALHOST-TEST")) {
			// TODO : mettre un assert propre
			assertTrue(connection.testOK() != null);
		}
	}
	
	@Test
	public void getTables() throws IOException, ParseException, ClassNotFoundException, SQLException {

		try(MitsiConnection connection = datasourceManager.getConnection("LOCALHOST-TEST")) {
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

		
		try(MitsiConnection connection = datasourceManager.getConnection("LOCALHOST-TEST")) {
			List<Index> li = connection.getSchemaIndexes(null);
			assertTrue(li != null);
			assertTrue(li==null || li.size() > 0);
			
		}
	}
	
	@Test
	public void getConstraints() throws IOException, ParseException, ClassNotFoundException, SQLException {

		try(MitsiConnection connection = datasourceManager.getConnection("LOCALHOST-TEST")) {
			List<Constraint> lc = connection.getSchemaConstraints(null);
			assertTrue(lc != null);
			assertTrue(lc==null || lc.size() > 0);
			
		}
	}

	@Test
	public void changeSchema() throws IOException, ParseException, ClassNotFoundException, SQLException {

		try(MitsiConnection connection = datasourceManager.getConnection("LOCALHOST-TEST")) {
			connection.changeSchema("XE2");

		}
	}
	
	@Test
	public void connectOnOtherSchema() throws IOException, ParseException, ClassNotFoundException, SQLException {

		try(MitsiConnection connection = datasourceManager.getConnection("LOCALHOST-XE2-ON-TEST")) {
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
	public void getAllSchema() throws IOException, ParseException, ClassNotFoundException, SQLException {

		try(MitsiConnection connection = datasourceManager.getConnection("LOCALHOST-TEST")) {
			
			List<Schema> schemas = connection.getAllSchemas();
			assertTrue(schemas.size() > 0);
			
		}
	}
	
	@Test
	public void getDetailsTables() throws IOException, ParseException, ClassNotFoundException, SQLException {

		try(MitsiConnection connection = datasourceManager.getConnection("LOCALHOST-TEST")) {
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
		try(MitsiConnection connection = datasourceManager.getConnection("LOCALHOST-TEST")) {
			List<Relation> lr = connection.getAllRelations();
			assertTrue(lr != null);
			assertTrue(lr==null || lr.size() > 0);
		}		
	}
		
}
