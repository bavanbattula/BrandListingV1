let allServices = []
let categoryLevelServices = []
let allSubServicesArray = [];
let selectedSubServiceArray = []

let allBrandRecords = []
document.addEventListener('DOMContentLoaded', () => {
    // Fetch data from the server
    fetch('/data')
        .then(response => response.json())
        .then(data => {
            // Populate the data element with fetched records
            //document.getElementById('data').textContent = JSON.stringify(data.records);
            const cardsContainer = document.getElementById('cards-container');
            let categories = [];
            let categoryRecsArray = data.categoryRecords || [];
            allSubServicesArray = data.subServiceRecords || [];
            allBrandRecords = data.brandRecords || []
            let servicesArray = [];
            for (var i = 0; i < categoryRecsArray.length; i++) {
                categories.push(categoryRecsArray[i].Name);
                for (var j = 0; j < categoryRecsArray[i].Services__r.records.length; j++) {
                    let tempService = {
                        image: categoryRecsArray[i].Services__r.records[j].Image_URL__c,
                        header: categoryRecsArray[i].Services__r.records[j].Name,
                        description: categoryRecsArray[i].Services__r.records[j].Description__c,
                        productCategory: categoryRecsArray[i].Name
                    }
                    servicesArray.push(tempService);
                }
            }
            allServices = servicesArray;
            categoryLevelServices = allServices
            // Categories data (assuming you fetch this from the server or define it here)
            //const categories = ['Category 1', 'Category 2', 'Category 3', 'Category 4'];
            const dropdown = document.getElementById('categories-dropdown');
            let optionDef = document.createElement('option');
            optionDef.value = ''
            optionDef.textContent = 'All';
            dropdown.appendChild(optionDef);

            categories.forEach(category => {
                let option = document.createElement('option');
                option.value = category
                option.textContent = category;
                dropdown.appendChild(option);
            });

            dropdown.addEventListener('change', function () {
                categoryLevelServices = []
                const selectedCategory = this.value; // Get the selected value
                if (!!selectedCategory) {
                    for (var i = 0; i < allServices.length; i++) {
                        if (allServices[i].productCategory == selectedCategory) {
                            categoryLevelServices.push(allServices[i]);
                        }
                    }
                } else {
                    categoryLevelServices = allServices;
                }
                cardsContainer.innerHTML = ''
                // Populate the cards container with cards
                categoryLevelServices.forEach(card => {
                    cardsContainer.innerHTML += createCard(card);
                });
                console.log('Selected category:', selectedCategory);
                // Add any additional logic here, like filtering cards based on the selected category
            });




            // Function to generate HTML for each card
            function createCard(card) {
                return `
                    <div class="brand-card" onclick="onCardClick('${card.header}')">
                        <img src="${card.image}" alt="Brand Image">
                        <div class="brand-card-content">
                            <h3>${card.header}</h3>
                            <p>${card.description}</p>
                        </div>
                    </div>
                `;
            }

            // Populate the cards container with cards
            servicesArray.forEach(card => {
                cardsContainer.innerHTML += createCard(card);
            });

            window.onCardClick = onCardClick;

            // Function to handle card click and retrieve the header name
            function onCardClick(headerName) {
                console.log('Clicked Header:', headerName);
                document.getElementById("homeblock").className = 'hideHome';
                document.getElementById("subServiceBlock").className = 'showSubService';
                document.getElementById('selectedservice').textContent = headerName;
                selectedSubServiceArray = []
                for (var i = 0; i < allSubServicesArray.length; i++) {
                    let eachRec = allSubServicesArray[i];
                    if (headerName == eachRec.Service__r.Name) {
                        let tempService = {
                            image: eachRec.Image_URL__c,
                            name: eachRec.Name,
                            serviceName: eachRec.Service__r.Name,
                            lastupdated: eachRec.Last_Updated__c
                        }
                        selectedSubServiceArray.push(tempService);
                    }
                }

                const tilesContainer = document.getElementById('tiles-container');
                tilesContainer.innerHTML = '';
                function createTile(brand) {
                    return `
                        <div class="subService-tile"  onclick="onSubServiceTileClick('${brand.name}','${brand.lastupdated}')">
                            <img src="${brand.image}" alt="${brand.name}" class="subService-tile-img">
                            <div class="subService-tile-content">
                                <div class="subService-tile-header">${brand.name}</div>
                            </div>
                        </div>
                    `;
                }

                // Populate the tiles container with brand tiles
                selectedSubServiceArray.forEach(brand => {
                    tilesContainer.innerHTML += createTile(brand);
                });
                // You can now perform any additional logic with the headerName value
                //alert('You clicked on ' + headerName);
            }

            window.onSubServiceTileClick = onSubServiceTileClick;

            // Function to handle card click and retrieve the header name
            function onSubServiceTileClick(headerName,lastupdated) {
                console.log('Clicked Header:', headerName);
                document.getElementById("homeblock").className = 'hideHome';
                document.getElementById("subServiceBlock").className = 'hideSubService';
                document.getElementById("brandsPageBlock").className = 'showBrandPage';
                document.getElementById('selectedservice').textContent = headerName;

                let brandsData = [];
                for(var m=0;m<allBrandRecords.length;m++){
                    if(headerName == allBrandRecords[m].Sub_Service__r.Name){
                        let desc = allBrandRecords[m].Description__c.includes('{percentage}') ? allBrandRecords[m].Description__c.replace('{percentage}',allBrandRecords[m].Offer__c) : allBrandRecords[m].Description__c;
                        let termpBrand = {
                            logo: allBrandRecords[m].Image_URL__c,
                            header: allBrandRecords[m].Name,
                            description: desc,
                            coupon: allBrandRecords[m].Coupon_Code__c,
                            link: allBrandRecords[m].Website_URL__c
                        }
                        if(!!allBrandRecords[m].End_Date__c){
                            termpBrand.validity = "Valid until: "+ allBrandRecords[m].End_Date__c
                        }
                        brandsData.push(termpBrand)
                    }
                }

                const couponsContainer = document.getElementById('brandsPage-coupons-container');
                couponsContainer.innerHTML = ''
                function createBrandCard(brand, index) {
                    return `
                        <div class="brandsPage-card">
                            <div class="brandsPage-sequence">${index + 1}</div>
                            <img src="${brand.logo}" alt="Brand Logo">
                            <div class="brandsPage-card-content">
                            <h3>${brand.header}</h3>
                            <p>${brand.description}</p>
                              ${brand.coupon ? `
                            <div>
                            <span class="brandsPage-coupon-code">${brand.coupon}</span>
                            <button class="brandsPage-copy-btn" onclick="copyCoupon('${brand.coupon}')">Copy</button>
                            </div>
                            <div class="brandsPage-validity">${brand.validity}</div>` : ''}
                             </div>
                             <a href="${brand.link}" class="brandsPage-visit-btn" target="_blank" rel="noopener noreferrer">Visit Site</a>
                        </div>
                    `;
                }

                brandsData.forEach((brand, index) => {
                    couponsContainer.innerHTML += createBrandCard(brand, index);
                });

                // Set last updated date
                const lastUpdatedDate = lastupdated;
                document.getElementById('brandsPage-last-updated-date').textContent = lastUpdatedDate;
            }

        })
        .catch(error => console.error('Error fetching data:', error));
});
function copyCoupon(coupon) {
    navigator.clipboard.writeText(coupon).then(() => {
        // Show the toast message
        showToast('Copied!', 'toast-success');
       
    });
}
function goToHome() {
    document.getElementById("homeblock").className = 'showHome';
    document.getElementById("subServiceBlock").className = 'hideSubService';
    document.getElementById("brandsPageBlock").className = 'hideBrandPage';
}
function toggleUI() {
    let categoryLevelServices2 = []
    var inputValue = document.getElementById("searchtext").value;
    let flag = false;
    if (!!inputValue) {
        inputValue = inputValue.toLowerCase();
        for (var i = 0; i < allServices.length; i++) {
            if (allServices[i].header.toLowerCase().includes(inputValue)) {
                flag = true;
                categoryLevelServices2.push(allServices[i]);
            }
        }
    }
    if (!inputValue || !flag) {
        categoryLevelServices2 = categoryLevelServices;
    }
    const cardsContainer = document.getElementById('cards-container');
    cardsContainer.innerHTML = ''
    // Populate the cards container with cards
    categoryLevelServices2.forEach(card => {
        cardsContainer.innerHTML += createCard2(card);
    });

    // Function to generate HTML for each card
    function createCard2(card) {
        return `
            <div class="brand-card" onclick="onCardClick('${card.header}')">
                <img src="${card.image}" alt="Brand Image">
                <div class="brand-card-content">
                    <h3>${card.header}</h3>
                    <p>${card.description}</p>
                </div>
            </div>
        `;
    }
}

function handleSearchSubServices() {
    let categoryLevelServices2 = []
    var inputValue = document.getElementById("subservicesearchbox").value;
    let flag = false;
    if (!!inputValue) {
        inputValue = inputValue.toLowerCase();
        for (var i = 0; i < selectedSubServiceArray.length; i++) {
            if (selectedSubServiceArray[i].name.toLowerCase().includes(inputValue)) {
                flag = true;
                categoryLevelServices2.push(selectedSubServiceArray[i]);
            }
        }
    }
    if (!inputValue || !flag) {
        categoryLevelServices2 = selectedSubServiceArray;
    }
    const cardsContainer = document.getElementById('tiles-container');
    cardsContainer.innerHTML = ''
    // Populate the cards container with cards
    categoryLevelServices2.forEach(card => {
        cardsContainer.innerHTML += createCard2(card);
    });

    // Function to generate HTML for each card
    function createCard2(brand) {
        return `
             <div class="subService-tile" onclick="onSubServiceTileClick('${brand.name}','${brand.lastupdated}')">
                            <img src="${brand.image}" alt="${brand.name}" class="subService-tile-img">
                            <div class="subService-tile-content">
                                <div class="subService-tile-header">${brand.name}</div>
                            </div>
             </div>
        `;
    }
}

function showToast(message, className) {
    // showToast('Copied!', 'toast-success');
    //showToast('Failed to copy!', 'toast-error');
    const toast = document.getElementById('toast');
    
    toast.textContent = message;
    toast.className = `toast ${className} show`;
    
    // Hide the toast after 3 seconds
    setTimeout(() => {
        toast.className = `toast`; // Reset to default
    }, 1000);
}