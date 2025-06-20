export type VoteType = {
  scrutin: {
    '@xmlns': string;
    '@xmlns:xsi': string;
    uid: string;
    numero: string;
    organeRef: string;
    legislature: string;
    sessionRef: string;
    seanceRef: string;
    dateScrutin: string;
    quantiemeJourSeance: string;
    typeVote: {
      codeTypeVote: string;
      libelleTypeVote: string;
      typeMajorite: string;
    };
    sort: {
      code: string;
      libelle: string;
    };
    titre: string;
    demandeur: {
      texte: string;
      referenceLegislative: string | null;
    };
    objet: {
      libelle: string;
      dossierLegislatif: string | null;
      referenceLegislative: string | null;
    };
    modePublicationDesVotes: string;
    syntheseVote: {
      nombreVotants: string;
      suffragesExprimes: string;
      nbrSuffragesRequis: string;
      annonce: string;
      decompte: {
        nonVotants: string;
        pour: string;
        contre: string;
        abstentions: string;
        nonVotantsVolontaires: string;
      };
    };
    lieuVote: string;
  };
};
