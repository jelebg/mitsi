package org.mitsi.test.users;

import static org.junit.Assert.*;

import java.io.IOException;
import java.sql.SQLException;

import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mitsi.datasources.MitsiDatasource;
import org.mitsi.datasources.MitsiLayer;
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
		mitsiDatasources.loadIfNecessary();
	}

	@Test
	public void test() throws IOException, ClassNotFoundException, SQLException {

		mitsiDatasources.loadIfNecessary();
		MitsiDatasource datasource = mitsiDatasources.getDatasource(null, true, "POSTGRE-TEST");
		assertEquals(datasource.getName(), "POSTGRE-TEST");

		assert(mitsiDatasources.getDatasources(null, true).size() > 0);

		MitsiLayer layer = mitsiDatasources.getLayer(null, false,"TEST-LAYER");
		assertEquals(layer.getName(), "TEST-LAYER");
		assertEquals(layer.getDatasources().size(), 2);

		assert(mitsiDatasources.getLayers(null, true).size() > 0);

	}

}
