angular

.module("mitsiApp", ["ui.bootstrap", "ui.layout", "ui.router", 
                     'ui.grid', 'ui.grid.resizeColumns', 'ui.grid.exporter', 'ui.grid.selection',
                     'ui.grid.infiniteScroll', 'ui.grid.cellNav'
                     , 'rzModule'
                     ])

.config(function($stateProvider, $urlRouterProvider, $locationProvider, $injector){
	 
	   $stateProvider
		   .state("workbench", 
				   { url: "/workbench",
			   		 templateUrl: "workbenchtabs.html", 
			   		 controller:'workbenchtabsCtrl' 
			   		})
			   //controller:angular.module("mitsiApp").controller('workbenchtabsCtrl') })
		   .state("workbench.details", 
				   { url: "/wdetails", 
			   		 templateUrl: "wdetails.html",
			   		 controller:'wdetailsCtrl' 
			   	   })
	       .state("workbench.graph", 
	    		   { url: "/wgraph", 
	    	         templateUrl: "wgraph.html",
			   		 controller:'wgraphCtrl' 
	    	       })
           .state("workbench.sql", 
        		   { url: "/wsql", 
        	         templateUrl: "wsql.html",
			   		 controller:'wsqlCtrl' 
        	       })
           .state("workbench.data", 
        		   { url: "/wdata", 
        	   		 templateUrl: "wdata.html",
			   		 controller:'wdataCtrl' 
        	   	   });

	   $urlRouterProvider.otherwise("/workbench/wdetails");
	   //$locationProvider.html5Mode(true);

});
