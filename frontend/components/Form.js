import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import axios from "axios";

// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: "full name must be at least 3 characters",
  fullNameTooLong: "full name must be at most 20 characters",
  sizeIncorrect: "size must be S or M or L",
};

const getInitialErrors = () => ({
  fullName: "",
  size: "",
  toppings: "",
});

// 👇 Here you will create your schema.
const schema = Yup.object().shape({
  fullName: Yup.string()
    .required("Full name is required")
    .min(3, validationErrors.fullNameTooShort)
    .max(20, validationErrors.fullNameTooLong),
  size: Yup.string()
    .required("Size is required")
    .oneOf(["S", "M", "L"], validationErrors.sizeIncorrect),
  toppings: Yup.array().of(Yup.string()),
});

// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: "1", text: "Pepperoni" },
  { topping_id: "2", text: "Green Peppers" },
  { topping_id: "3", text: "Pineapple" },
  { topping_id: "4", text: "Mushrooms" },
  { topping_id: "5", text: "Ham" },
];

export default function Form() {
  const [formValue, setFormValue] = useState({
    fullName: "",
    size: "",
    toppings: [],
  });

  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState(getInitialErrors());
  const [enabled, setEnabled] = useState(false);
  const [failure, setFailure] = useState(null);

  useEffect(() => {
    schema
      .isValid(formValue)
      .then((valid) => setEnabled(valid))
      .catch(() => setEnabled(false));
  }, [formValue]);

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;

    // For checkboxes, we'll update the value based on whether it's checked or not.
    // For other input types (text and select), we use the value as is.
    let newValue = type === "checkbox" ? checked : value;
    console.log(name);
    if (name === "fullName") {
      newValue = newValue.trim();
    }
    setFormValue((prevState) => ({
      ...prevState,
      [name]: newValue,
    }));

    // Validate the updated value and set the error message
    Yup.reach(schema, name)
      .validate(newValue)
      .then(() => {
        setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
      })
      .catch((err) => {
        setErrors((prevErrors) => ({ ...prevErrors, [name]: err.errors[0] }));
      });
  };

  const onCheckboxChange = (event) => {
    const { value, checked } = event.target;
    let newToppings = [...formValue.toppings];

    if (checked) {
      newToppings = [...newToppings, value];
    } else {
      newToppings = newToppings.filter((topping) => topping !== value);
    }

    setFormValue({ ...formValue, toppings: newToppings });
  };

  const onSubmit = (event) => {
    event.preventDefault();
    axios
      .post("http://localhost:9009/api/order", {
        ...formValue,
        toppings: Array.from(formValue.toppings), // Ensure toppings is an array
      })
      .then((res) => {
        setFormValue({ fullName: "", size: "", toppings: [] });
        setSuccess(res.data.message); // Use 'res.data' instead of 'res.response.data'
        setFailure(null);
        setEnabled(true); // Set 'enabled' to true on success
      })
      .catch((err) => {
        setFailure(err.response.data.message);
        setSuccess("");
        setEnabled(false); // Set 'enabled' to false on failure
      });
  };

  return (
    <div>
      <h2>Order Your Pizza</h2>
      {success && (
        <div
          style={{
            padding: "10px",
            backgroundColor: "green",
            color: "white",
            fontFamily: "sans-serif",
          }}
        >
          {success}
        </div>
      )}
      {failure && (
        <div>
          <p>
            Thank you for your order, {formValue.fullName}! Your{" "}
            {formValue.size} pizza with {formValue.toppings.length} toppings is
            on the way.
          </p>
          {/*  <p>Error Data: {JSON.stringify(failure.data)}</p> */}
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div className="input-group">
          <label htmlFor="fullName">Full Name</label>
          <br />
          <input
            placeholder="Type full name"
            onChange={onChange}
            id="fullName"
            name="fullName"
            type="text"
            value={formValue.fullName}
          />
        </div>
        {errors.fullName && (
          <div className="error">
            {formValue.fullName.length < 3
              ? validationErrors.fullNameTooShort
              : formValue.fullName.length > 20
              ? validationErrors.fullNameTooLong
              : ""}
          </div>
        )}

        <div className="input-group">
          <div>
            <label htmlFor="size">Size</label>
            <br />
            <select
              onChange={onChange}
              id="size"
              name="size"
              value={formValue.size}
            >
              <option value="">----Choose Size----</option>
              {/* Fill out the missing options */}
              <option value="S">Small</option>
              <option value="M">Medium</option>
              <option value="L">Large</option>
            </select>
          </div>
          {errors.size && <div className="error">{errors.size}</div>}
        </div>

        <div className="input-group">
          {/* 👇 Maybe you could generate the checkboxes dynamically */}

          {toppings.map((topping) => (
            <label key={topping.topping_id}>
              <input
                name="toppings" // This should be the same for all checkboxes since they are part of a checkbox group.
                type="checkbox"
                value={topping.topping_id} // The value should be the ID, as expected by the API.
                checked={formValue.toppings.includes(topping.topping_id)} // This will check if the topping_id is in the formData toppings array.
                onChange={onCheckboxChange}
              />
              {topping.text}
              <br />
            </label>
          ))}
        </div>

        {/* 👇 Make sure the submit stays disabled until the form validates! */}
        <input type="submit" disabled={!enabled} />
      </form>
    </div>
  );
}