/**
 * LivingFlex – Danish / English UI strings
 */
(function () {
    var STORAGE_KEY = 'lf-lang';

    var STRINGS = {
        da: {
            'meta.pageTitle': 'LivingFlex - Møbelabonnement',

            'lang.da': 'DA',
            'lang.en': 'EN',
            'lang.switchAria': 'Vælg sprog',

            'nav.build': 'Byg dit eget hjem',
            'nav.ready': 'Færdige pakker',
            'nav.floor': 'Send plantegning',
            'nav.cancel': 'Opsig abonnement',
            'nav.terms': 'Vilkår og betingelser',

            'login.aria': 'Log ind',

            'hero.title': 'Møbler din bolig – klar til udlejning via Alfa Mobility',
            'hero.lead': 'LivingFlex leverer en komplet møbelpakke til din bolig, så den fremstår skarp på billeder og fungerer perfekt for dine lejere. Levering, indbæring og opsætning er inkluderet.',
            'hero.b1': 'Designet til udlejning',
            'hero.b2': 'Professionel opsætning',
            'hero.b3': 'Ingen stor investering',
            'hero.cta': 'Kom i gang',

            'getStarted.desc': 'Vælg hvor du vil starte, og udforsk mulighederne der passer til dine behov.',
            'getStarted.card1Title': 'Byg dit eget hjem',
            'getStarted.card1Text': 'Sammensæt din egen pakke og tilpas den til din bolig.',
            'getStarted.card2Title': 'Færdige pakker',
            'getStarted.card2Text': 'Se kuraterede pakker, der er klar til indflytning.',
            'getStarted.card3Title': 'Skræddersyet',
            'getStarted.card3Text': 'Send din plantegning og få et skræddersyet forslag.',

            'faq.title': 'Spørgsmål & svar',
            'faq.q1': 'Hvordan fungerer abonnementet?',
            'faq.a1': 'Du vælger en pakke og kan justere den over tid, når dine behov ændrer sig.',
            'faq.q2': 'Hvad er inkluderet i leveringen?',
            'faq.a2': 'Vi koordinerer levering og opsætning ud fra dit valg.',
            'faq.q3': 'Kan jeg ændre produkter senere?',
            'faq.a3': 'Ja, du kan bytte produkter, når dit behov ændrer sig.',
            'faq.q4': 'Er der en minimumsperiode?',
            'faq.a4': 'Fleksible vilkår gør det muligt at skalere op eller ned uden lange bindinger.',
            'faq.q5': 'Hvad hvis jeg flytter?',
            'faq.a5': 'Giv os besked, så planlægger vi logistikken til din nye adresse.',
            'faq.q6': 'Hvordan får jeg support?',
            'faq.a6': 'Brug kontaktformularen nedenfor, så vender vi hurtigt tilbage.',

            'contact.title': 'Kontakt os',
            'contact.name': 'Fulde navn',
            'contact.email': 'E-mail',
            'contact.message': 'Besked',
            'contact.submit': 'Send besked',

            'build.heroTitle': 'Byg dit eget hjem',
            'build.categories': 'Kategorier',
            'build.yourPackage': 'Din pakke',
            'build.startupPrice': 'Opstartspris:',
            'build.month14': 'Måned 1-4:',
            'build.month512': 'Måned 5-12:',
            'build.month13p': 'Måned 13+:',
            'build.logisticsQ': 'Hvorfor er der et gebyr på 3.000 DKK?',
            'build.logisticsA': 'Opstartsgebyret på 3.000 DKK dækker logistik, koordinering og ordrebehandling. Det omfatter behandling af din ordre, koordinering af levering og administrativ håndtering af dit abonnement.',
            'build.reviewPackage': 'Se pakke',

            'ready.heroTitle': 'Færdige pakker',
            'ready.heroLead': 'Vælg en komplet pakke og flyt ind med lethed.',
            'ready.previewAlt': 'Forhåndsvisning af færdige pakker',
            'ready.note': 'Billedet ovenfor er vejledende og viser ikke nødvendigvis de præcise produkter.',
            'ready.pkg1': 'Pakke 1',
            'ready.pkg2': 'Pakke 2',
            'ready.setupLogistics': 'Opsætning & logistik (inkl. moms)',
            'ready.monthlyRent': 'Månedlig leje pr. påbegyndt måned (inkl. moms)',
            'ready.removal': 'Afhentning (inkl. moms)',
            'ready.choose': 'Vælg pakke',

            'ready.p1.1': 'Spisebord til mindst 4 personer',
            'ready.p1.2': '4 matchende spisebordsstole',
            'ready.p1.3': 'Sovesofa',
            'ready.p1.4': 'Sofabord',
            'ready.p1.5': '2 x 90x200 senge med topmadras',
            'ready.p1.6': '2 sæt pude/dyne',
            'ready.p1.7': '2 sideborde',
            'ready.p1.8': '2 sengebordslamper',
            'ready.p1.9': '2 typer belysning',
            'ready.p1.10': '55" TV samt TV-bord',
            'ready.p2.1': 'Spisebord til mindst 6 personer',
            'ready.p2.2': '6 matchende spisebordsstole',
            'ready.p2.3': 'Sovesofa',
            'ready.p2.4': 'Sofabord',
            'ready.p2.5': '4 x 90x200 senge med topmadras',
            'ready.p2.6': '4 sæt pude/dyne',
            'ready.p2.7': '4 sideborde',
            'ready.p2.8': '4 sengebordslamper',
            'ready.p2.9': '2 typer belysning',
            'ready.p2.10': '55" TV samt TV-bord',

            'floor.heroTitle': 'Send plantegning',
            'floor.heroLead': 'Upload din plantegning, så laver vi et personligt indretningsforslag til dig',
            'floor.uploadTitle': 'Upload din plantegning',
            'floor.uploadDesc': 'Send os et foto eller billede af din plantegning, så vender vores team tilbage med et personligt indretningsforslag til din bolig.',
            'floor.imageLabel': 'Plantegning (billede)',
            'floor.dropzoneHtml': 'Træk og slip din plantegning her, eller <span class="browse-link">vælg fil</span>',
            'floor.fileInfo': 'PNG, JPG op til 10MB',
            'floor.previewAlt': 'Forhåndsvisning af plantegning',
            'floor.phone': 'Telefonnummer',
            'floor.address': 'Adresse',
            'floor.notesLabel': 'Yderligere noter (valgfrit)',
            'floor.notesPlaceholder': 'Eventuelle særlige ønsker eller præferencer til din indretning...',
            'floor.submit': 'Send plantegning',
            'floor.howTitle': 'Sådan fungerer det',
            'floor.s1Title': 'Upload din plantegning',
            'floor.s1Text': 'Tag et billede eller upload en plantegning af din bolig',
            'floor.s2Title': 'Udfyld dine oplysninger',
            'floor.s2Text': 'Angiv dine kontaktoplysninger og eventuelle særlige ønsker',
            'floor.s3Title': 'Vi gennemgår og designer',
            'floor.s3Text': 'Vores team gennemgår din plantegning og laver et personligt forslag',
            'floor.s4Title': 'Modtag dit forslag',
            'floor.s4Text': 'Vi sender et detaljeret indretningsforslag pr. e-mail',

            'cancel.heroTitle': 'Opsig abonnement',
            'cancel.heroLead': 'Find og opsig dit abonnement med dit ordrenummer og navn',
            'cancel.findTitle': 'Find din ordre',
            'cancel.findDesc': 'Indtast dit ordrenummer og det navn, der blev brugt ved bestilling, for at finde og opsige dit abonnement.',
            'cancel.orderNo': 'Ordrenummer',
            'cancel.orderNoPh': 'Indtast ordrenummer (fx 1234567890)',
            'cancel.orderName': 'Navn',
            'cancel.orderNamePh': 'Indtast navnet der blev brugt ved bestilling',
            'cancel.search': 'Søg ordre',
            'cancel.foundTitle': 'Ordre fundet',
            'cancel.labelOrderNo': 'Ordrenummer:',
            'cancel.labelName': 'Navn:',
            'cancel.labelAddress': 'Adresse:',
            'cancel.endSub': 'Afslut abonnement',

            'terms.heroTitle': 'Vilkår og betingelser',
            'terms.heroLead': 'Kort overblik over de vigtigste vilkår.',
            'terms.summaryTitle': 'Vilkår i korte træk',
            'terms.summaryLead': 'Denne side giver et overblik over de vigtigste vilkår. De fulde vilkår fremgår af den endelige abonnementsaftale.',
            'terms.subTitle': 'Abonnement',
            'terms.sub1': 'Minimum binding: 12 måneder',
            'terms.sub2': 'Pris: Opstartsgebyr + månedligt abonnement (1–4 / 5–12 / 13+)',
            'terms.sub3': 'Fortsætter månedligt efter 12 måneder',
            'terms.termTitle': 'Opsigelse',
            'terms.term1': 'Kan ikke opsiges i de første 12 måneder',
            'terms.term2': 'Efter 12 måneder: 1 måneds opsigelse til udgangen af den efterfølgende måned',
            'terms.deliveryTitle': 'Levering',
            'terms.delivery1': 'Leveres og monteres efter aftale',
            'terms.delivery2': 'Kunden skal sikre adgang',
            'terms.orderTitle': 'Ordregyldighed',
            'terms.order1': 'Bestillinger online er kun reservationer',
            'terms.order2': 'Bindende aftale kræver underskrevet kontrakt og godkendelse',
            'terms.footerHtml': 'Spørgsmål? Kontakt os via kontaktformularen eller skriv til <strong>info@livingflex.com</strong>.<br><a class="terms-pdf-link" href="LivingFlex_Terms_Full.pdf" target="_blank" rel="noopener">Download det komplette vilkår (PDF)</a>',

            'modal.review.title': 'Din pakke',
            'modal.review.deliveryTitle': 'Leveringsmuligheder',
            'modal.review.curbside': 'Kantstenslevering',
            'modal.review.setup': 'Levering og opsætning',
            'modal.review.extraRoomTitle': 'Ekstra rum',
            'modal.review.noExtraRoom': 'Intet ekstra rum',
            'modal.review.addExtraRoom': 'Tilføj ekstra rum',
            'modal.review.price0month': '0 DKK / måned',
            'modal.review.priceExtraMonth': '+1.250 DKK / måned',
            'modal.review.perMonth': '/ måned',
            'modal.review.close': 'Luk',
            'modal.review.submitPkg': 'Indsend pakke',
            'modal.form.title': 'Indsend pakke',
            'modal.form.moveAddress': 'Flytteadresse',
            'modal.form.installDate': 'Ønsket installationsdato',
            'modal.form.back': 'Tilbage',
            'modal.form.submit': 'Indsend',

            'modal.qty.title': 'Vælg antal',
            'modal.qty.label': 'Antal:',
            'modal.qty.cancel': 'Annuller',
            'modal.qty.add': 'Tilføj til pakke',
            'img.product': 'Produkt',

            'modal.detail.prices': 'Priser',
            'modal.detail.startup': 'Opstart:',
            'modal.detail.m14': 'Måned 1-4:',
            'modal.detail.m512': 'Måned 5-12:',
            'modal.detail.m13': 'Måned 13+:',
            'modal.detail.size': 'Størrelse',
            'modal.detail.add': 'Tilføj til pakke',

            'modal.login.title': 'Log ind',
            'modal.login.user': 'Navn',
            'modal.login.pass': 'Adgangskode',
            'modal.login.submit': 'Log ind',

            'modal.order.title': 'Ordrebekræftelse',
            'modal.order.subtitle': 'Tak for din ordre!',
            'modal.order.orderNo': 'Ordrenummer',
            'modal.order.customerInfo': 'Kundeoplysninger',
            'modal.order.name': 'Navn:',
            'modal.order.email': 'E-mail:',
            'modal.order.phone': 'Telefon:',
            'modal.order.address': 'Adresse:',
            'modal.order.installWeek': 'Installationsuge:',
            'modal.order.deliveryOpt': 'Leveringsmulighed:',
            'modal.order.lines': 'Ordrelinjer',
            'modal.order.priceSummary': 'Prissammenfatning',
            'modal.order.startupLbl': 'Opstartspris:',
            'modal.order.m14': 'Måned 1-4:',
            'modal.order.m512': 'Måned 5-12:',
            'modal.order.m13': 'Måned 13+:',
            'modal.order.footerMsg': 'Din ordre er modtaget og vil blive behandlet snarest. Du kan se din ordre i adminpanelet.',
            'modal.order.close': 'Luk',

            'footer.brand': 'LivingFlex ApS',
            'footer.powered': 'Powered by Agent360 Group ApS',
            'footer.quote': 'Anbefalet møbelløsning til boliger udlejet via Alfa Mobility',

            'js.startup': 'Opstart',
            'js.addToPackage': 'Tilføj til pakke',
            'js.noProductsAssortment': 'Der er endnu ingen produkter. Sortimentet og lejevilkår skal først aftales.',
            'js.noProductsCategory': 'Ingen produkter i denne kategori.',
            'js.productNotFound': 'Produktet blev ikke fundet.',
            'js.packageEmpty': 'Din pakke er tom. Tilføj produkter først.',
            'js.noItemsPackage': 'Ingen varer i pakken',
            'js.orientationRight': 'Højreorienteret',
            'js.orientationLeft': 'Venstreorienteret',
            'js.orientationRightShort': '(højreorienteret)',
            'js.orientationLeftShort': '(venstreorienteret)',
            'js.na': 'N/A',
            'js.week': 'Uge',
            'js.total': 'Total',
            'js.review.readyNote': 'Billedet er kun til reference.',
            'js.review.readyImgAlt': 'Færdig pakke',
            'js.review.setupLogistics': 'Opsætning & logistik (inkl. moms):',
            'js.review.month14': 'Måned 1-4:',
            'js.review.month512': 'Måned 5-12:',
            'js.review.month13': 'Måned 13+:',
            'js.review.removal': 'Afhentning (inkl. moms):',
            'js.review.startupFull': 'Opstart (inkl. levering & logistik, koordinering & håndtering):',
            'js.confirm.extraRoom': 'Ekstra rum – 1.250 DKK / måned',
            'js.confirm.noExtraRoom': 'Intet ekstra rum – 0 DKK / måned',
            'js.confirm.setup': 'Levering og opsætning – 2.000 DKK',
            'js.confirm.curbside': 'Kantstenslevering – 0 DKK',
            'js.confirm.notSpecified': 'Ikke angivet',
            'js.sku': 'SKU',
            'js.loginError': 'Ugyldigt brugernavn eller adgangskode',
            'js.orderMissingFields': 'Fejl: Ordren mangler påkrævede oplysninger. Prøv igen.',
            'js.orderEmailFail': 'Ordrebekræftelse kunne ikke sendes.',
            'js.orderEmailFailServer': 'Ordrebekræftelse kunne ikke sendes. Tjek at e-mailserveren kører.',
            'js.installDateMin': 'Installationsdatoen skal være mindst 14 dage ude i fremtiden.',
            'js.pickImageFile': 'Vælg venligst en billedfil',
            'js.imageTooLarge': 'Billedet er for stort. Maks. 10 MB.',
            'js.floorConfirmFail': 'Vi kunne ikke sende bekræftelsen.',
            'js.floorUploadImage': 'Upload venligst et billede af plantegningen',
            'js.floorThanks': 'Tak! Vi har sendt en bekræftelse til din e-mail. Vores team gennemgår din plantegning og vender tilbage snarest.',
            'js.cancelEnterBoth': 'Indtast både ordrenummer og navn.',
            'js.cancelNotFound': 'Ordre ikke fundet. Tjek ordrenummer og navn og prøv igen.',
            'js.cancelNoProducts': 'Ingen produkter fundet i denne ordre.',
            'js.cancelSearchFirst': 'Ingen ordre fundet. Søg efter din ordre først.',
            'js.cancelConfirm': 'Er du sikker på, at du vil opsige dette abonnement? Denne handling kan ikke fortrydes.',
            'js.cancelSuccess': 'Dit abonnement er opsagt. Ordren er flyttet til status “{status}” i adminpanelet.',
            'js.statusPending': 'Annulleret, afventer afhentning',
            'js.statusCollected': 'Annulleret og afhentet',
            'js.adminNoProducts': 'Ingen produkter tilgængelige. Tilføj produkter i adminpanelet.'
        },
        en: {
            'meta.pageTitle': 'LivingFlex - Furniture subscription',

            'lang.da': 'DA',
            'lang.en': 'EN',
            'lang.switchAria': 'Choose language',

            'nav.build': 'Build your own home',
            'nav.ready': 'Ready-made packages',
            'nav.floor': 'Send floor plan',
            'nav.cancel': 'Cancel subscription',
            'nav.terms': 'Terms and conditions',

            'login.aria': 'Log in',

            'hero.title': 'Furnish your home – ready for rental via Alfa Mobility',
            'hero.lead': 'LivingFlex delivers a complete furniture package for your home so it looks sharp in photos and works perfectly for your tenants. Delivery, carrying in and assembly are included.',
            'hero.b1': 'Designed for rental',
            'hero.b2': 'Professional setup',
            'hero.b3': 'No large upfront investment',
            'hero.cta': 'Get started',

            'getStarted.desc': 'Choose where to start and explore the options that fit your needs.',
            'getStarted.card1Title': 'Build your own home',
            'getStarted.card1Text': 'Put together your own package and tailor it to your home.',
            'getStarted.card2Title': 'Ready-made packages',
            'getStarted.card2Text': 'See curated packages ready for move-in.',
            'getStarted.card3Title': 'Tailored',
            'getStarted.card3Text': 'Send your floor plan and get a tailored proposal.',

            'faq.title': 'Questions & answers',
            'faq.q1': 'How does the subscription work?',
            'faq.a1': 'You choose a package and can adjust it over time as your needs change.',
            'faq.q2': 'What is included in delivery?',
            'faq.a2': 'We coordinate delivery and assembly based on your choice.',
            'faq.q3': 'Can I change products later?',
            'faq.a3': 'Yes, you can swap products when your needs change.',
            'faq.q4': 'Is there a minimum term?',
            'faq.a4': 'Flexible terms let you scale up or down without long commitments.',
            'faq.q5': 'What if I move?',
            'faq.a5': 'Let us know and we will plan logistics to your new address.',
            'faq.q6': 'How do I get support?',
            'faq.a6': 'Use the contact form below and we will get back to you quickly.',

            'contact.title': 'Contact us',
            'contact.name': 'Full name',
            'contact.email': 'Email',
            'contact.message': 'Message',
            'contact.submit': 'Send message',

            'build.heroTitle': 'Build your own home',
            'build.categories': 'Categories',
            'build.yourPackage': 'Your package',
            'build.startupPrice': 'Startup price:',
            'build.month14': 'Month 1–4:',
            'build.month512': 'Month 5–12:',
            'build.month13p': 'Month 13+:',
            'build.logisticsQ': 'Why is there a fee of 3,000 DKK?',
            'build.logisticsA': 'The 3,000 DKK startup fee covers logistics, coordination and order processing. It includes handling your order, coordinating delivery and administrative management of your subscription.',
            'build.reviewPackage': 'Review package',

            'ready.heroTitle': 'Ready-made packages',
            'ready.heroLead': 'Choose a complete package and move in with ease.',
            'ready.previewAlt': 'Preview of ready-made packages',
            'ready.note': 'The image above is indicative and may not show the exact products.',
            'ready.pkg1': 'Package 1',
            'ready.pkg2': 'Package 2',
            'ready.setupLogistics': 'Assembly & logistics (incl. VAT)',
            'ready.monthlyRent': 'Monthly rent per commenced month (incl. VAT)',
            'ready.removal': 'Pickup (incl. VAT)',
            'ready.choose': 'Choose package',

            'ready.p1.1': 'Dining table for at least 4 people',
            'ready.p1.2': '4 matching dining chairs',
            'ready.p1.3': 'Sofa bed',
            'ready.p1.4': 'Coffee table',
            'ready.p1.5': '2 x 90x200 beds with mattress topper',
            'ready.p1.6': '2 duvet/pillow sets',
            'ready.p1.7': '2 side tables',
            'ready.p1.8': '2 bedside lamps',
            'ready.p1.9': '2 types of lighting',
            'ready.p1.10': '55" TV and TV stand',
            'ready.p2.1': 'Dining table for at least 6 people',
            'ready.p2.2': '6 matching dining chairs',
            'ready.p2.3': 'Sofa bed',
            'ready.p2.4': 'Coffee table',
            'ready.p2.5': '4 x 90x200 beds with mattress topper',
            'ready.p2.6': '4 duvet/pillow sets',
            'ready.p2.7': '4 side tables',
            'ready.p2.8': '4 bedside lamps',
            'ready.p2.9': '2 types of lighting',
            'ready.p2.10': '55" TV and TV stand',

            'floor.heroTitle': 'Send floor plan',
            'floor.heroLead': 'Upload your floor plan and we will create a personal interior proposal for you',
            'floor.uploadTitle': 'Upload your floor plan',
            'floor.uploadDesc': 'Send us a photo or image of your floor plan and our team will get back with a tailored interior proposal for your home.',
            'floor.imageLabel': 'Floor plan (image)',
            'floor.dropzoneHtml': 'Drag and drop your floor plan here, or <span class="browse-link">choose file</span>',
            'floor.fileInfo': 'PNG, JPG up to 10MB',
            'floor.previewAlt': 'Floor plan preview',
            'floor.phone': 'Phone number',
            'floor.address': 'Address',
            'floor.notesLabel': 'Additional notes (optional)',
            'floor.notesPlaceholder': 'Any special wishes or preferences for your interior...',
            'floor.submit': 'Send floor plan',
            'floor.howTitle': 'How it works',
            'floor.s1Title': 'Upload your floor plan',
            'floor.s1Text': 'Take a photo or upload a floor plan of your home',
            'floor.s2Title': 'Fill in your details',
            'floor.s2Text': 'Provide your contact details and any special requests',
            'floor.s3Title': 'We review and design',
            'floor.s3Text': 'Our team reviews your floor plan and prepares a tailored proposal',
            'floor.s4Title': 'Receive your proposal',
            'floor.s4Text': 'We send a detailed interior proposal by email',

            'cancel.heroTitle': 'Cancel subscription',
            'cancel.heroLead': 'Find and cancel your subscription with your order number and name',
            'cancel.findTitle': 'Find your order',
            'cancel.findDesc': 'Enter your order number and the name used when ordering to find and cancel your subscription.',
            'cancel.orderNo': 'Order number',
            'cancel.orderNoPh': 'Enter order number (e.g. 1234567890)',
            'cancel.orderName': 'Name',
            'cancel.orderNamePh': 'Enter the name used when ordering',
            'cancel.search': 'Search order',
            'cancel.foundTitle': 'Order found',
            'cancel.labelOrderNo': 'Order number:',
            'cancel.labelName': 'Name:',
            'cancel.labelAddress': 'Address:',
            'cancel.endSub': 'End subscription',

            'terms.heroTitle': 'Terms and conditions',
            'terms.heroLead': 'Short summary of the main terms.',
            'terms.summaryTitle': 'Terms at a glance',
            'terms.summaryLead': 'This page provides an overview of the main terms. Full terms are defined in the final subscription agreement.',
            'terms.subTitle': 'Subscription',
            'terms.sub1': 'Minimum commitment: 12 months',
            'terms.sub2': 'Pricing: Initial setup fee + monthly subscription (1–4 / 5–12 / 13+)',
            'terms.sub3': 'Continues monthly after 12 months',
            'terms.termTitle': 'Termination',
            'terms.term1': 'Cannot be terminated during the first 12 months',
            'terms.term2': 'After 12 months: 1 month notice to end of following month',
            'terms.deliveryTitle': 'Delivery',
            'terms.delivery1': 'Delivered and installed as agreed',
            'terms.delivery2': 'Customer must ensure access',
            'terms.orderTitle': 'Order validity',
            'terms.order1': 'Orders placed online are reservations only',
            'terms.order2': 'Binding agreement requires signed contract and approval',
            'terms.footerHtml': 'Questions? Contact us via the contact form or write to <strong>info@livingflex.com</strong>.<br><a class="terms-pdf-link" href="LivingFlex_Terms_Full.pdf" target="_blank" rel="noopener">Download full terms (PDF)</a>',

            'modal.review.title': 'Your package',
            'modal.review.deliveryTitle': 'Delivery options',
            'modal.review.curbside': 'Curbside delivery',
            'modal.review.setup': 'Delivery and assembly',
            'modal.review.extraRoomTitle': 'Extra room',
            'modal.review.noExtraRoom': 'No extra room',
            'modal.review.addExtraRoom': 'Add extra room',
            'modal.review.price0month': '0 DKK / month',
            'modal.review.priceExtraMonth': '+1,250 DKK / month',
            'modal.review.perMonth': '/ month',
            'modal.review.close': 'Close',
            'modal.review.submitPkg': 'Submit package',
            'modal.form.title': 'Submit package',
            'modal.form.moveAddress': 'Move-in address',
            'modal.form.installDate': 'Preferred installation date',
            'modal.form.back': 'Back',
            'modal.form.submit': 'Submit',

            'modal.qty.title': 'Choose quantity',
            'modal.qty.label': 'Quantity:',
            'modal.qty.cancel': 'Cancel',
            'modal.qty.add': 'Add to package',
            'img.product': 'Product',

            'modal.detail.prices': 'Prices',
            'modal.detail.startup': 'Startup:',
            'modal.detail.m14': 'Month 1–4:',
            'modal.detail.m512': 'Month 5–12:',
            'modal.detail.m13': 'Month 13+:',
            'modal.detail.size': 'Size',
            'modal.detail.add': 'Add to package',

            'modal.login.title': 'Log in',
            'modal.login.user': 'Username',
            'modal.login.pass': 'Password',
            'modal.login.submit': 'Log in',

            'modal.order.title': 'Order confirmation',
            'modal.order.subtitle': 'Thank you for your order!',
            'modal.order.orderNo': 'Order number',
            'modal.order.customerInfo': 'Customer details',
            'modal.order.name': 'Name:',
            'modal.order.email': 'Email:',
            'modal.order.phone': 'Phone:',
            'modal.order.address': 'Address:',
            'modal.order.installWeek': 'Installation week:',
            'modal.order.deliveryOpt': 'Delivery option:',
            'modal.order.lines': 'Order lines',
            'modal.order.priceSummary': 'Price summary',
            'modal.order.startupLbl': 'Startup price:',
            'modal.order.m14': 'Month 1–4:',
            'modal.order.m512': 'Month 5–12:',
            'modal.order.m13': 'Month 13+:',
            'modal.order.footerMsg': 'Your order has been received and will be processed shortly. You can view your order in the admin panel.',
            'modal.order.close': 'Close',

            'footer.brand': 'LivingFlex ApS',
            'footer.powered': 'Powered by Agent360 Group ApS',
            'footer.quote': 'Recommended furniture solution for homes rented via Alfa Mobility',

            'js.startup': 'Startup',
            'js.addToPackage': 'Add to package',
            'js.noProductsAssortment': 'There are no products yet. The assortment and rental terms must be agreed first.',
            'js.noProductsCategory': 'No products in this category.',
            'js.productNotFound': 'Product not found.',
            'js.packageEmpty': 'Your package is empty. Add products first.',
            'js.noItemsPackage': 'No items in package',
            'js.orientationRight': 'Right-oriented',
            'js.orientationLeft': 'Left-oriented',
            'js.orientationRightShort': '(right-oriented)',
            'js.orientationLeftShort': '(left-oriented)',
            'js.na': 'N/A',
            'js.week': 'Week',
            'js.total': 'Total',
            'js.review.readyNote': 'This image is for reference only.',
            'js.review.readyImgAlt': 'Ready package',
            'js.review.setupLogistics': 'Assembly & logistics (incl. VAT):',
            'js.review.month14': 'Month 1–4:',
            'js.review.month512': 'Month 5–12:',
            'js.review.month13': 'Month 13+:',
            'js.review.removal': 'Pickup (incl. VAT):',
            'js.review.startupFull': 'Startup (incl. delivery & logistics, coordination & handling):',
            'js.confirm.extraRoom': 'Extra room – 1,250 DKK / month',
            'js.confirm.noExtraRoom': 'No extra room – 0 DKK / month',
            'js.confirm.setup': 'Delivery and assembly – 2,000 DKK',
            'js.confirm.curbside': 'Curbside delivery – 0 DKK',
            'js.confirm.notSpecified': 'Not specified',
            'js.sku': 'SKU',
            'js.loginError': 'Invalid username or password',
            'js.orderMissingFields': 'Error: The order is missing required information. Please try again.',
            'js.orderEmailFail': 'Order confirmation could not be sent.',
            'js.orderEmailFailServer': 'Order confirmation could not be sent. Check that the email server is running.',
            'js.installDateMin': 'The installation date must be at least 14 days in the future.',
            'js.pickImageFile': 'Please choose an image file',
            'js.imageTooLarge': 'The image is too large. Maximum size is 10 MB.',
            'js.floorConfirmFail': 'We could not send the confirmation.',
            'js.floorUploadImage': 'Please upload an image of the floor plan',
            'js.floorThanks': 'Thank you! We have sent a confirmation to your email. Our team will review your floor plan and get back to you shortly.',
            'js.cancelEnterBoth': 'Enter both order number and name.',
            'js.cancelNotFound': 'Order not found. Check order number and name and try again.',
            'js.cancelNoProducts': 'No products found in this order.',
            'js.cancelSearchFirst': 'No order found. Search for your order first.',
            'js.cancelConfirm': 'Are you sure you want to cancel this subscription? This cannot be undone.',
            'js.cancelSuccess': 'Your subscription has been cancelled. The order has been moved to “{status}” in the admin panel.',
            'js.statusPending': 'Cancelled, awaiting pickup',
            'js.statusCollected': 'Cancelled and collected',
            'js.adminNoProducts': 'No products available. Add products in the admin panel.'
        }
    };

    function getLang() {
        try {
            var s = localStorage.getItem(STORAGE_KEY);
            return s === 'en' ? 'en' : 'da';
        } catch (e) {
            return 'da';
        }
    }

    function setLang(lang) {
        if (lang !== 'da' && lang !== 'en') return;
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) { /* ignore */ }
        document.documentElement.lang = lang === 'da' ? 'da' : 'en';
        applyTranslations();
        document.querySelectorAll('.lang-btn').forEach(function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
            btn.setAttribute('aria-pressed', btn.getAttribute('data-lang') === lang ? 'true' : 'false');
        });
        window.dispatchEvent(new CustomEvent('lf-lang-changed', { detail: { lang: lang } }));
    }

    function t(key) {
        var lang = getLang();
        var dict = STRINGS[lang] || STRINGS.da;
        if (dict[key] !== undefined) return dict[key];
        if (STRINGS.da[key] !== undefined) return STRINGS.da[key];
        return key;
    }

    function applyTranslations() {
        var lang = getLang();
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var k = el.getAttribute('data-i18n');
            if (k) el.textContent = t(k);
        });
        document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
            var k = el.getAttribute('data-i18n-html');
            if (k) el.innerHTML = t(k);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
            var k = el.getAttribute('data-i18n-placeholder');
            if (k) el.setAttribute('placeholder', t(k));
        });
        document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
            var k = el.getAttribute('data-i18n-aria');
            if (k) el.setAttribute('aria-label', t(k));
        });
        document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
            var k = el.getAttribute('data-i18n-alt');
            if (k) el.setAttribute('alt', t(k));
        });
        document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
            var k = el.getAttribute('data-i18n-title');
            if (k) el.setAttribute('title', t(k));
        });
        document.title = t('meta.pageTitle');
    }

    function initLangSwitch() {
        document.querySelectorAll('.lang-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                setLang(btn.getAttribute('data-lang'));
            });
        });
        var lang = getLang();
        document.documentElement.lang = lang === 'da' ? 'da' : 'en';
        applyTranslations();
        document.querySelectorAll('.lang-btn').forEach(function (btn) {
            var isActive = btn.getAttribute('data-lang') === lang;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    }

    window.LF_i18n = {
        t: t,
        getLang: getLang,
        setLang: setLang,
        applyTranslations: applyTranslations,
        initLangSwitch: initLangSwitch,
        STRINGS: STRINGS
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLangSwitch);
    } else {
        initLangSwitch();
    }
})();
