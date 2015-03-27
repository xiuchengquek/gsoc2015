/**
 * Created by quek on 22/03/2015.
 */



/* factory that do the call and parse the data to a format more easily consumed by each directive and controller */
heter.factory('dataServices', ['$http', '$q', function dataServices($http, $q) {
    var dataServices = {};
    var url = 'http://104.236.9.88:8080/OncoBlocks/webservice.do?query=get_patient_bundle';
    var header = { 'Content-type': 'application/json' };

    function reduceBiopsy(data) {
        /** take a biopsy array and redcue it content into an object where the key is the gene name and
         and the value is alleic frequence **/
        var biopsy = {};
        angular.forEach(data, function (value, key) {
            var gene_id;
            gene_id = value['geneSymbol']
            biopsy[gene_id] = {
                'ref' : value['referenceAlleleReads'],
                'alt' : value['alternativeAlleleReads'],
                'ratio': value['alternativeAlleleReads'] /
                    value['referenceAlleleReads']}

        }, biopsy);
        return biopsy
    }
    // function that takes a treatmentList and return all genes with mutations in it
    function findMutations(data) {
        var mutationlist = [];
        angular.forEach(data, function (value, key) {
            this.push(value['geneSymbol'])
        }, mutationlist);
        return mutationlist;
    }

    // function that wraps around findMutations and find the union of mutations between all treatment
    function collateMutations(data) {
        var collated, collation = [];
        angular.forEach(data, function (value, key) {
            var mutationList = []
            mutationList = findMutations(value['mutationList'])
            this.push(mutationList)
        }, collation);

        collated = _.flatten(collation)
        collated = _.uniq(collated)
        return collated
    }

    // function to check each treatment and for missing genes, create a empty entry
    function checkFill(data, list) {
        var diffMuts, existedMuts = [];
        existedMuts = Object.keys(data);
        diffMuts = _.difference(list, existedMuts);

        angular.forEach(diffMuts, function (value, key) {
            data[value] = {
                'ref' : 0,
                'alt' : 0,
                'ratio': 0};
        });
        return data;

    }

    // function to get infomation of a gene from the biopsy profile, this function is used to transpose data.
    function getGeneInfo(gene, profile) {
        var geneInfo = [];
        angular.forEach(profile, function (value, key) {
        this.push(value[gene])
        }, geneInfo);
        return geneInfo;
    }
    // function to parse data to allow data to be used for the directives
    function transposeData(data) {
        var mutationList = [];
        var biopsyProfile = {};
        var tranposedData = {};

        mutationList = data['mutationList'];
        biopsyProfile = data['patientProfile'];

        angular.forEach(biopsyProfile, function (value, key) {
            this[key] = checkFill(value, mutationList);
        }, biopsyProfile);

        angular.forEach(mutationList, function (value, key) {
            tranposedData[value] = getGeneInfo(value, biopsyProfile);

        });
        return tranposedData
    }

    // function to fill in missing gene information for each biopsy
    function assignMutations(data) {
        var patientProfile = {}
        var mutationList = []
        var mutationList = collateMutations(data);




        angular.forEach(data, function (value, key) {
            biopsyData = reduceBiopsy(value["mutationList"]);
            patientProfile[key] = biopsyData
        });

        return {'patientProfile': patientProfile, 'mutationList': mutationList}
    };

    // method that takes the data and return data usable for each directive
    dataServices.generateData = function () {
        var data = assignMutations(dataServices.data['genomicProfileList']);
        return transposeData(data)
    };

    dataServices.currentBiopsy = { 'value' : undefined}


    dataServices.setBiopsy = function(val){
      dataServices.currentBiopsy = {value : val}



    } ;

    dataServices.getBiopsy = function(){

        var biopsyData = {'value' : ''}
        if (typeof dataServices.data!== 'undefined' && typeof dataServices.currentBiopsy.value !=='undefined' ) {
            biopsyData.value = dataServices.data['genomicProfileList'][dataServices.currentBiopsy.value]['tissueType']

        }



        return biopsyData;
    }


    // main method for calling the rest api
    dataServices.call = function () {

        return $http.get(url, header)
            .then(function (results) {
                dataServices.data = results.data;
                return results.data
            })

    };


    return dataServices
}])
