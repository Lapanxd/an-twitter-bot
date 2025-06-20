export type Amendment = {
  signataires: {
    auteur: {
      typeAuteur: string;
      acteurRef: string;
      groupePolitiqueRef: string;
      libelle?: string;
    };
  };
  corps: {
    contenuAuteur: {
      dispositif: string;
      exposeSommaire: string;
    };
  };
}
