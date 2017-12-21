angular

.module("mitsiApp", ["ui.bootstrap", "ui.layout", "ui.router", 
                     'ui.grid', 'ui.grid.resizeColumns', 'ui.grid.exporter', 'ui.grid.selection',
                     'ui.grid.infiniteScroll', 'ui.grid.cellNav'
                     , 'rzModule', 'ui.codemirror'
                     ])

.config(function($stateProvider, $urlRouterProvider, $locationProvider, $injector){
	 
	   $stateProvider
		   .state("workbench", 
				   { url: "/workbench",
			   		 templateUrl: "views/workbenchtabs.html", 
			   		 controller:'workbenchtabsCtrl' 
			   		})
			   //controller:angular.module("mitsiApp").controller('workbenchtabsCtrl') })
		   .state("workbench.details", 
				   { url: "/wdetails", 
			   		 templateUrl: "views/wdetails.html",
			   		 controller:'wdetailsCtrl' 
			   	   })
	       .state("workbench.graph", 
	    		   { url: "/wgraph", 
	    	         templateUrl: "views/wgraph.html",
			   		 controller:'wgraphCtrl' 
	    	       })
           .state("workbench.sql", 
        		   { url: "/wsql", 
        	         templateUrl: "views/wsql.html",
			   		 controller:'wsqlCtrl' 
        	       })
           .state("workbench.rules",
        		   { url: "/wrules",
        	         templateUrl: "views/wrules.html",
			   		 controller:'wrulesCtrl'
        	       })
           .state("workbench.data",
        		   { url: "/wdata", 
        	   		 templateUrl: "views/wdata.html",
			   		 controller:'wdataCtrl' 
        	   	   })
           .state("workbench.diff",
        		   { url: "/wdiff",
        	   		 templateUrl: "views/wdiff.html",
			   		 controller:'wdiffCtrl'
        	   	   });

	   $urlRouterProvider.otherwise("/workbench/wgraph");
	   //$locationProvider.html5Mode(true);

});
