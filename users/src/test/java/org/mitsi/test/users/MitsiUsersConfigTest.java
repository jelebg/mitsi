package org.mitsi.test.users;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.io.IOException;

import org.json.simple.parser.ParseException;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mitsi.users.MitsiUsersConfig;
import org.mitsi.users.MitsiUsersException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:spring/application-context.xml")
public class MitsiUsersConfigTest {

	@Autowired
	MitsiUsersConfig mitsiUsersConfig;
	
	@Test
	public void mitsiUsersConfigTest() throws IOException {
		mitsiUsersConfig.loadIfNeccessary();
	}

	@Test
	public void test() throws IOException, ParseException, MitsiUsersException {

		mitsiUsersConfig.loadIfNeccessary();
		assertFalse(mitsiUsersConfig.authenticate("user_wrong", "guestmdp"));
		assertTrue(mitsiUsersConfig.authenticate("guest", "guestmdp"));
		assertFalse(mitsiUsersConfig.authenticate("guest", "mdp_wrong"));
		assertTrue(mitsiUsersConfig.authenticate("test", "testclearpassword"));
		assertFalse(mitsiUsersConfig.authenticate("test", "mdp_wrong"));
		
		assertEquals(mitsiUsersConfig.getLdapUrl()                    , "ldap://localhost:10389/");
		assertEquals(mitsiUsersConfig.getLdapApplicationDN()      , "sn=mitsi+cn=mitsi,dc=applications");
		assertEquals(mitsiUsersConfig.getLdapApplicationPassword(), "bonnevaux");
		assertEquals(mitsiUsersConfig.getLdapUserDNPattern()      , "n={0}+sn={0},dc=users");
		assertEquals(mitsiUsersConfig.getLdapGroupSearchPattern() , "ou=groups");
		assertEquals(mitsiUsersConfig.getLdapGroupRoleAttribute() , "ou");
		assertEquals(mitsiUsersConfig.getLdapMandatoryRole()      , "ROLE_MITSIGROUP");
		
		assertArrayEquals(mitsiUsersConfig.getGroups().get("xe2") , new String[]{ "test", "guest" });

		
	}

}
