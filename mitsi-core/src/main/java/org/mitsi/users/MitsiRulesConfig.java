package org.mitsi.users;

import java.util.List;

import org.mitsi.rules.Rule;

public interface MitsiRulesConfig {

	void loadIfNecessary();
	List<Rule> getRules(); 
	
}
