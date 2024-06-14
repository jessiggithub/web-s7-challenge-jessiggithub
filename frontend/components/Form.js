import React, { useState, useEffect } from 'react'
import * as Yup from 'yup'

// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L'
}

// 👇 Here you will create your schema.

// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
]

const formSchema = Yup.object().shape({
  fullName: Yup.string()
    .required('Full name is required')
    .min(3, 'Full name must be at least 3 characters')
    .max(20, 'Full name must be at most 20 characters'),
  size: Yup.string()
    .required('Size is required')
    .oneOf(['S', 'M', 'L'], 'Size must be S, M, or L'),
  toppings: Yup.array()
    .of(Yup.string())
    .min(1, 'At least one topping is required'),
});

const initialFormData = {
  fullName: '',
  size: '',
  toppings: [],
};

export default function Form() {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

  useEffect(() => {
    formSchema.isValid(formData).then(valid => {
      setIsSubmitEnabled(valid)
    });
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked} = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        toppings: checked ? [...prev.toppings, value] : prev.toppings.filter(topping=> topping !== value),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await formSchema.validate(formData, { abortEarly: false });
      console.log(`Order placed successfully!`)
      if (formData.toppings.length > 0) {
      console.log(`Toppings: ${formData.toppings.join(",")}`);
    }
      setFormData(initialFormData)
      setErrors({});
    } catch (err) {
      const formattedErrors = err.inner.reduce((acc, error) => {
        acc[error.path] = error.message;
        return acc;
      }, {});
      setErrors(formattedErrors)
      }
     }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Order Your Pizza</h2>
      <div className="input-group">
          <label htmlFor="fullName">Full Name</label><br />
          <input name="fullName" placeholder="Type full name" id="fullName" type="text" value={formData.fullName} onChange={handleInputChange} />
        {errors.fullName && <p>{errors.fullName}</p>}
        </div>

      <div className="input-group">
          <label htmlFor="size">Size</label><br />
          <select name="size" id="size" value={formData.size} onChange={handleInputChange}>
            <option value="">----Choose Size----</option>
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
            {/* Fill out the missing options */}
          </select>
          {errors.size && <p>{errors.size}</p>}
        </div>

      <div className="input-group">
        {/* 👇 Maybe you could generate the checkboxes dynamically */}
        {toppings.map(topping => (
         <label key={topping.topping_id}>
          <input
            name="toppings"
            type="checkbox"
            value={topping.text}
            checked={formData.toppings.includes(topping.text)}
            onChange={handleInputChange}
          />
          {topping.text}<br />
        </label>
        ))}
        {errors.toppings && <p>{errors.toppings}</p>}
        
          
      </div>
      {/* 👇 Make sure the submit stays disabled until the form validates! */}
      <button type="submit" disabled={!isSubmitEnabled}>Submit</button>
    </form>
  );
}
