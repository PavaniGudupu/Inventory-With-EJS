
// id should be > 0 and integer.

const id_Validation = async (req, res, next) => {
  const id = req.body.id || req.params.id;
    function sendAlert(msg) {
    res.set("Content-Type", "text/html");
    return res.send(`
      <script>
        alert("${msg}");
        window.history.back();   
      </script>
    `);
  }

  if (id !== undefined && id !== "") {
    const idNum = Number(id);

    if (isNaN(idNum)) {
      return sendAlert("▲ ID must be a valid number.");
    }

    if (idNum <= 0) {
      return sendAlert("▲ ID must be greater than zero.");
    }
  }

  next();
};


// mandatory feilds + price conditions

const field_Validation = async (req, res, next) => {
  const { name, category_id, mrp, sp, cp } = req.body;

  const mrpNum = parseFloat(mrp);
  const spNum = parseFloat(sp);
  const cpNum = parseFloat(cp);

  req.mrpNum = mrpNum;
  req.spNum = spNum;
  req.cpNum = cpNum;

// Sends HTML with JavaScript
// Shows an alert("message")
// Uses window.history.back() to return to the form page
// Stops execution
  function sendAlert(msg) {
    res.set("Content-Type", "text/html");
    return res.send(`
      <script>
        alert("${msg}");
        window.history.back();   
      </script>
    `);
  }

  if (!name || !category_id || !mrp || !sp || !cp) {
    return sendAlert("▲ Missing required fields.");
  }

  if (isNaN(mrpNum) || isNaN(spNum) || isNaN(cpNum)) {
    return sendAlert("▲ MRP, SP, CP must be valid numbers.");
  }

  if (mrpNum <= spNum || mrpNum <= cpNum) {
    return sendAlert("▲ MRP must be greater than SP and CP.");
  }

  if (spNum < cpNum) {
    return sendAlert("▲ SP should not be less than CP.");
  }

  next();
};


export { id_Validation, field_Validation };



