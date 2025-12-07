
// id should be > 0 and integer.

const id_Validation = async (req, res, next) => {
  const id = req.body.id || req.params.id;

  if (id !== undefined && id !== "") {
    const idNum = Number(id);

    if (isNaN(idNum)) {
      return res.status(400).send("▲ ID must be a valid number.");
    }

    if (idNum <= 0) {
      return res.status(400).send("▲ ID must be greater than zero.");
    }
  }

  next();
};


// mandatory feilds + price conditions

const field_Validation = (async(req, res, next) => {
    const { id, name, category_id, mrp, sp, cp, classification, size } = req.body;

    const mrpNum = Number(mrp);
    const spNum = Number(sp);
    const cpNum = Number(cp);

    //Instead of re‑parsing in every route, you attach them to req.
    req.mrpNum = mrpNum;
    req.spNum = spNum;
    req.cpNum = cpNum;


    if(!name || !category_id || !mrp || !sp || !cp) {
        return res.status(400).send("▲ Missing required fields.");
    }

    if(isNaN(mrpNum) || isNaN(spNum) || isNaN(cpNum)){
        return res.status(400).send("▲ MRP, SP, CP must be valid numbers.");
    }


    if (mrpNum <= spNum || mrpNum <= cpNum) {
        return res.status(400).send("▲ MRP must be greater than SP and CP.");
    }

    
    if(spNum < cpNum) {
        return res.status(400).send("▲ SP should not be less than CP.");
    }

    next();
})






export { field_Validation, id_Validation };



