package org.mitsi.test.users;

import static org.junit.Assert.*;

import java.io.IOException;
import java.sql.SQLException;

import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mitsi.datasources.MitsiDatasource;
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
	@Ignore // TODO faire un mock pour que ça refonctionne
	public void test() throws IOException, ClassNotFoundException, SQLException {

		mitsiDatasources.loadIfNeccessary();
		MitsiDatasource datasource = mitsiDatasources.getDatasource(null, true, "POSTGRE-TEST");
		assertEquals(datasource.getName(), "POSTGRE-TEST");
		
	}

}
