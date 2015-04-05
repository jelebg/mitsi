package org.mitsi.mitsiwar;

import org.mitsi.mitsiwar.connections.Client;
import org.mitsi.users.PublicDatasources;
import org.springframework.beans.factory.annotation.Autowired;


/**
 * Servlet implementation class TestGsonServlet
 */
public class TestGsonServlet extends GsonServlet<TestGsonRequest, TestGsonResponse> {
	private static final long serialVersionUID = 1L;

	@Autowired
	private PublicDatasources publicDatasources;

	
	public TestGsonServlet() {
        super(TestGsonRequest.class);
    }

 
	@Override
	public TestGsonResponse proceed(TestGsonRequest request, Client connectedClient) throws Exception {
		System.out.println("sql='"+request.sql+"'");
		System.out.println("message='"+request.message+"'");
		
		// TODO : a revoir le .read ...
		publicDatasources.loadIfNeccessary();
		
		TestGsonResponse testGsonResponse = new TestGsonResponse();
		for(String datasourceName : publicDatasources.getDatasourceNames()) {
			testGsonResponse.resultats.add(datasourceName);
		}
		
		/*testGsonResponse.resultats.add("un");
		testGsonResponse.resultats.add("deux");
		testGsonResponse.resultats.add("trois");
		testGsonResponse.resultats.add("quatre");
		testGsonResponse.resultats.add("cinq");*/
		return testGsonResponse;
	}

}
