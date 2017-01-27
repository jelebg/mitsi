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
import org.mitsi.users.MitsiDatasources;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:spring/application-context.xml")
public class MitsiDatasourcesTest {

	@Autowired
	private MitsiDatasources mitsiDatasources;
	
	@Test
	public void mitsiDatasourcesTest() throws IOException {
		mitsiDatasources.loadIfNeccessary();
	}

	@Test
	public void test() throws IOException, ParseException, ClassNotFoundException, SQLException {

		mitsiDatasources.loadIfNeccessary();
		assertEquals(mitsiDatasources.getDatasource(null, true, "LOCALHOST-TEST").getName(), "LOCALHOST-TEST");
		
	}

}
