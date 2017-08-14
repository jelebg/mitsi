package org.mitsi.test.users;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import java.io.IOException;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mitsi.users.MitsiUsersConfig;
import org.mitsi.users.MitsiUsersException;
import org.mitsi.users.MitsiUsersFile;
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
		mitsiUsersConfig.loadIfNecessary();
	}

	@Test
	public void test() throws IOException, MitsiUsersException {

		mitsiUsersConfig.loadIfNecessary();
		assertFalse(mitsiUsersConfig.authenticate("user_wrong", "guestmdp"));
		assertTrue(mitsiUsersConfig.authenticate("guest", "guestmdp"));
		assertFalse(mitsiUsersConfig.authenticate("guest", "mdp_wrong"));
		assertTrue(mitsiUsersConfig.authenticate("test", "testclearpassword"));
		assertFalse(mitsiUsersConfig.authenticate("test", "mdp_wrong"));
		
		MitsiUsersFile.LdapAuthent ldapAuthent = mitsiUsersConfig.getLdapAuthent();
		assertNotNull(ldapAuthent);
		assertEquals(ldapAuthent.url                , "ldap://localhost:10389/");
		assertEquals(ldapAuthent.applicationDN      , "sn=mitsi+cn=mitsi,dc=applications");
		assertEquals(ldapAuthent.applicationPassword, "bonnevaux");
		assertEquals(ldapAuthent.userDNPattern      , "cn={0}+sn={0},dc=users");
		assertEquals(ldapAuthent.groupSearchPattern , "ou=groups");
		assertEquals(ldapAuthent.groupRoleAttribute , "ou");
		assertEquals(ldapAuthent.mandatoryRole      , "ROLE_MITSIGROUP");
		
		assertArrayEquals(mitsiUsersConfig.getGroups().get("xe2") , new String[]{ "test", "guest" });
		assertNull(mitsiUsersConfig.getGroups().get("_invalidgroup"));
		
	}

}
