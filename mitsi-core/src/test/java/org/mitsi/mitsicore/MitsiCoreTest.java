package org.mitsi.mitsicore;

import java.io.IOException;


import org.junit.Test;
import org.junit.runner.RunWith;
import org.mitsi.users.PublicDatasources;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:spring/application-context.xml")
public class MitsiCoreTest {
	
	@Autowired
	private PublicDatasources publicDatasources;

	@Test
	public void myWonderfulTest() throws IOException {
		publicDatasources.loadIfNeccessary();
	}
}
