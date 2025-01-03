"use client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { useFilePicker } from "use-file-picker";
import {
  FileAmountLimitValidator,
  FileTypeValidator,
  FileSizeValidator,
  ImageDimensionsValidator,
} from "use-file-picker/validators";
import { addProduct, uploadImage } from "./post";
import { useForm } from "@tanstack/react-form";
import Loading from "@/components/Loading";
import { v4 as uuidv4 } from "uuid";
import { useAuthState } from "react-firebase-hooks/auth";

import { auth, db } from "@/firebase/firebase";
import convertCurrency from "@/functions/convertion";
import { doc, getDoc } from "firebase/firestore";
const defaultData = {
  categories: [
    "Electronics",
    "Computer Accessories",
    "Men Clothing",
    "Women Clothing",
    "Kids Clothing",
    "Laptops",
    "Computers",
    "Mobiles",
    "Accessories",
    "Makeup",
    "Perfumes",
    "Others",
  ],
  dtime: ["3-5 business days", "10-15 business days", "30 days"],
  return: [
    "None",
    "3 days return policy",
    "7 days return policy",
    "14 days return policy",
    "30 days return policy",
  ],
};

function FieldInfo({ field }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <em className="text-red-500">{field.state.meta.errors.join(", ")}</em>
      ) : null}
      {field.state.meta.isValidating ? "Validating..." : null}
    </>
  );
}

export default function AddProductPage() {
  const router = useRouter();
  const [newVariant, setNewVariant] = useState({ name: "", vals: "" });
  const [newSpec, setNewSpec] = useState({ name: "", value: "" });
  const [newKeywords, setNewKeywords] = useState("");
  const [imageState, setImageState] = useState({
    urls: [],
    paths: [],
    loading: false,
    currentIndex: 0,
    imageUpdated: false,
  });

  const [user] = useAuthState(auth);
  const [productId, setProdId] = useState();
  const [cr, setCr] = useState();
  const [sellerCurrency, setSellerCur] = useState();
  useEffect(() => {
    console.log("init");
    if (!productId) {
      setProdId(uuidv4().toString().replaceAll("-", ""));
    }

    async function calCR() {
      await getDoc(doc(db, "seller", user.uid)).then((snap) => {
        const data = snap.data();
        setSellerCur(data["currency"]);
      });
      if (sellerCurrency != "PKR") {
        setCr(await convertCurrency(1, "PKR", sellerCurrency));
      } else {
        setCr(1);
      }
    }
    if (!cr && user) {
      calCR();
    }
  });
  const processTextToArray = (text) => {
    return text
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  const handleAddSpec = (field) => {
    if (newSpec.name && newSpec.value) {
      const newSpecObject = {
        name: newSpec.name,
        value: newSpec.value,
      };
      const updatedSpecs = [...(field.state.value || []), newSpecObject];
      field.handleChange(updatedSpecs);
      setNewSpec({ name: "", value: "" });
    }
  };

  const handleAddVariant = (field) => {
    if (newVariant.name && newVariant.vals) {
      const newVariantObject = {
        name: newVariant.name,
        vals: processTextToArray(newVariant.vals),
      };
      const updatedVariants = [...(field.state.value || []), newVariantObject];
      field.handleChange(updatedVariants);
      setNewVariant({ name: "", vals: "" });
    }
  };
  const { openFilePicker, filesContent, errors } = useFilePicker({
    readAs: "DataURL",
    accept: "image/*",
    multiple: true,
    validators: [
      new FileAmountLimitValidator({ max: 5 }),
      new FileTypeValidator([
        "jpeg",
        "png",
        "gif",
        "bmp",
        "tiff",
        "webp",
        "heic",
        "svg",
        "psd",
        "raw",
        "ico",
        "eps",
        "pdf",
        "ai",
        "avif",
      ]),
      new FileSizeValidator({ maxFileSize: 5 * 1024 * 1024 }),
      new ImageDimensionsValidator({
        maxHeight: 2000,
        maxWidth: 2000,
      }),
    ],
  });
  useEffect(() => {
    if (filesContent.length > 0) {
      setImageState((prev) => ({ ...prev, loading: true }));
      const file = filesContent[0];

      uploadImage(productId, file, imageState.currentIndex)
        .then(({ imagePath, url }) => {
          setImageState((prev) => {
            const newPaths = [...prev.paths];
            newPaths[imageState.currentIndex] = imagePath;
            const newurls = [...prev.urls];
            newurls[imageState.currentIndex] = url;
            return {
              ...prev,
              urls: newurls,
              paths: newPaths,
              loading: false,
              imageUpdated: true,
            };
          });
        })
        .catch((e) => {
          console.log(e);
          toast("Internal Server Error!");
          setImageState((prev) => ({ ...prev, loading: false }));
        });
    } else if (errors && errors.length > 0) {
      console.log(errors);
      toast("Incorrect File");
      setImageState((prev) => ({ ...prev, loading: false }));
    }
  }, [filesContent]);

  const form = useForm({
    defaultValues: {
      name: "",
      price: "",
      shortDescription: "",
      brand: "",
      stock: "",
      category: defaultData.categories[0],
      deliveryTime: defaultData.dtime[0],
      returns: defaultData.return[0],
      variants: [],
      specs: [],
      keywords: [],
      images: [],
      reviews: [],
      shipping_cost: 0,
      sponsered: false,
      premium: false,
    },
    onSubmit: async ({ value }) => {
      const productData = { ...value };
      try {
        console.log(user.uid);
        productData["seller"] = user.uid;
        productData["views"] = 0;
        productData["sales"] = 0;
        await addProduct(productId, productData, user.uid).then(() => {
          toast.success("Product added successfully!");
          router.replace(`/product/${productId}`);
        });
        // for (const image of images) {
        //      await uploadImage(newProductId, image).then(path =>{
        //setImagePaths(prev=>[...prev,])
        //     });
        // }
      } catch (error) {
        console.error(error);
        toast.error("Failed to add product");
      }
    },
  });

  useEffect(() => {
    if (imageState.imageUpdated) {
      form.setFieldValue("images", imageState.paths);
      setImageState((prev) => ({
        ...prev,
        imageUpdated: false,
      }));
      console.log("update", form.getFieldValue("images"));
    }
  }, [imageState.imageUpdated]);

  if (form.state.isSubmitting) {
    return (
      <div className="flex w-full h-full bg-bg items-center justify-center">
        <div className="w-40 h-40">
          <Loading className="text-text w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg min-h-screen w-full py-6 sm:px-6 lg:px-10">
      <p className="font-black text-2xl">Add New Product</p>
      <div className="flex flex-col gap-4 ">
        {errors.length > 0 && (
          <p className="text-red-500">Error: {errors[0].message}</p>
        )}
        <div className="justify-end flex flex-row w-full">
          <button
            className="bg-primary rounded-md px-4 py-1 text-bg"
            onClick={() => {
              form.handleSubmit();
            }}
          >
            Add Product
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <form.Field
            name={"images"}
            validators={{
              onChangeAsyncDebounceMs: 500,
              onChangeAsync: ({ value }) =>
                !value
                  ? "Atleast one image is required"
                  : value.length > 5
                    ? "Max 5 images allowed"
                    : undefined,
            }}
            children={(field) => {
              return (
                <div className="flex flex-col col-span-1 md:col-span-2">
                  <p className="font-bold text-2xl mt-14">Images*</p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 h-min">
                    {[
                      ...Array(
                        imageState.urls.length === 5
                          ? 5
                          : imageState.urls.length + 1,
                      ),
                    ].map((_, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          if (!imageState.loading) {
                            if (index === imageState.urls.length) {
                              setImageState((prev) => ({
                                ...prev,
                                currentIndex: index,
                              }));

                              openFilePicker();
                            }
                          }
                        }}
                        className="p-1 h-52 max-h-96 overflow-hidden border flex justify-center items-center bg-bg hover:cursor-pointer shadow-sm duration-300 hover:shadow-md rounded-md border-secondary/40 group"
                      >
                        {imageState.urls[index] ? (
                          <img
                            src={imageState.urls[index]}
                            className="h-52 object-contain aspect-auto group-hover:opacity-70 duration-300"
                          />
                        ) : !imageState.loading ? (
                          <div className="flex flex-col h-full group-hover:opacity-50 items-center justify-center duration-300">
                            <p>Add Image</p>
                            <Plus className="text-text" />
                          </div>
                        ) : (
                          <div className="flex flex-col h-full group-hover:opacity-50 items-center justify-center duration-300">
                            <Loading className="w-12 fill-text flex flex-row items-center " />
                            <p>Uploading</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <FieldInfo field={field} />
                </div>
              );
            }}
          />

          <div>
            <form.Field
              name={"name"}
              validators={{
                onChangeAsyncDebounceMs: 500,
                onChangeAsync: ({ value }) =>
                  !value
                    ? "Title is required"
                    : value.length < 10 || value.length > 250
                      ? "Title must be between 10 and 250 charaters"
                      : undefined,
              }}
              children={(field) => (
                <div className="flex flex-col w-min">
                  <p className="font-bold text-2xl mb-2">Title *</p>
                  <input
                    className="bg-bg border border-secondary/50 rounded-md px-2 py-1 min-w-full lg:min-w-96 outline-none"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      console.log(field);
                      field.handleChange(e.target.value);
                    }}
                  />
                  <FieldInfo field={field} />
                </div>
              )}
            />
          </div>

          <div>
            <form.Field
              validators={{
                onChangeAsyncDebounceMs: 500,
                onChangeAsync: ({ value }) =>
                  !value
                    ? "Price is required"
                    : value < 50 * cr
                      ? `Minium price is ${50 * cr} ${sellerCurrency}`
                      : undefined,
              }}
              name={"price"}
              children={(field) => (
                <div className="flex flex-col w-min">
                  <p className="font-bold text-2xl mb-2">Price *</p>
                  <input
                    className="bg-bg border border-secondary/50 rounded-md px-2 py-1 min-w-full lg:min-w-96 outline-none"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    type="number"
                    onChange={(e) =>
                      field.handleChange(parseFloat(e.target.value))
                    }
                  />
                  <FieldInfo field={field} />
                </div>
              )}
            />
          </div>

          <div>
            <form.Field
              // validators={{
              //   onChangeAsyncDebounceMs: 500,
              //   onChangeAsync: ({ value }) =>
              //     !value
              //       ? "Shipping Cost is required"
              //       : value < 0 * cr
              //         ? `Minium shipping is ${0 * cr} ${sellerCurrency}`
              //         : undefined,
              // }}
              name={"shipping_cost"}
              children={(field) => (
                <div className="flex flex-col w-min">
                  <p className="font-bold text-2xl mb-2">Shipping Cost *</p>
                  <input
                    className="bg-bg border border-secondary/50 rounded-md px-2 py-1 min-w-full lg:min-w-96 outline-none"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    type="number"
                    onChange={(e) =>
                      field.handleChange(parseFloat(e.target.value))
                    }
                  />
                  {/* <FieldInfo field={field} /> */}
                </div>
              )}
            />
          </div>

          <div>
            <form.Field
              name={"shortDescription"}
              validators={{
                onChangeAsyncDebounceMs: 500,
                onChangeAsync: ({ value }) =>
                  !value
                    ? "Description is required"
                    : value.length < 100 || value.length > 1000
                      ? "Description must be of 100 to 1000 charaters"
                      : undefined,
              }}
              children={(field) => (
                <div className="flex flex-col w-min">
                  <p className="font-bold text-2xl mb-2">Description *</p>
                  <input
                    className="bg-bg border outline-none border-secondary/50 rounded-md px-2 py-1 min-w-full lg:min-w-96"
                    id={field.name}
                    type="text"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldInfo field={field} />
                </div>
              )}
            />
          </div>

          <div>
            <form.Field
              name={"brand"}
              validators={{
                onChangeAsyncDebounceMs: 500,
                onChangeAsync: ({ value }) =>
                  !value
                    ? "Brand name is required"
                    : value.length < 10 || value.length > 100
                      ? "Brand name must be of 10 to 100 charaters"
                      : undefined,
              }}
              children={(field) => (
                <div className="flex flex-col w-min">
                  <p className="font-bold text-2xl mb-2">Brand *</p>
                  <input
                    className="bg-bg border outline-none border-secondary/50 rounded-md px-2 py-1 min-w-full lg:min-w-96"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldInfo field={field} />
                </div>
              )}
            />
          </div>

          <div>
            <form.Field
              name={"stock"}
              validators={{
                onChangeAsyncDebounceMs: 500,
                onChangeAsync: ({ value }) =>
                  !value ? "Stock is required" : undefined,
              }}
              children={(field) => (
                <div className="flex flex-col w-min">
                  <p className="font-bold text-2xl mb-2">Stock *</p>
                  <input
                    className="bg-bg border outline-none border-secondary/50 rounded-md px-2 py-1 min-w-full lg:min-w-96"
                    id={field.name}
                    name={field.name}
                    type="number"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(parseInt(e.target.value))
                    }
                  />
                  <FieldInfo field={field} />
                </div>
              )}
            />
          </div>
          <div>
            <form.Field
              name={"category"}
              children={(field) => (
                <>
                  <p className="font-bold text-2xl mb-2">Category</p>
                  <select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="px-4 border border-secondary py-2 rounded-md bg-bg"
                  >
                    {defaultData.categories.map((cat) => (
                      <option value={cat}>{cat}</option>
                    ))}
                  </select>
                </>
              )}
            />
          </div>

          <div>
            <form.Field
              name={"deliveryTime"}
              children={(field) => (
                <>
                  <p className="font-bold text-2xl mb-1">Delivery Time</p>
                  <p className="font-thin text-sm mb-2">
                    max time to deliver to any part of country
                  </p>
                  <select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="px-4 border border-secondary py-2 rounded-md bg-bg"
                  >
                    {defaultData.dtime.map((val) => (
                      <option value={val}>{val}</option>
                    ))}
                  </select>
                </>
              )}
            />
          </div>
          <div>
            <form.Field
              name={"returns"}
              children={(field) => (
                <>
                  <p className="font-bold text-2xl mb-1">Return Policy</p>
                  <select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="px-4 border border-secondary py-2 rounded-md bg-bg"
                  >
                    {defaultData.return.map((val) => (
                      <option value={val}>{val}</option>
                    ))}
                  </select>
                </>
              )}
            />
          </div>

          {/* Variants */}
          <div>
            <form.Field
              name="variants"
              children={(field) => (
                <>
                  <p className="font-bold text-2xl mb-1">Variants</p>
                  <div className="flex flex-col md:flex-row flex-wrap gap-2 w-min">
                    <input
                      type="text"
                      placeholder="Variant Name"
                      value={newVariant.name}
                      onChange={(e) =>
                        setNewVariant({ ...newVariant, name: e.target.value })
                      }
                      className="bg-bg border border-secondary/50 rounded-md px-2 py-1 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Values (comma-separated)"
                      value={newVariant.vals}
                      onChange={(e) =>
                        setNewVariant({ ...newVariant, vals: e.target.value })
                      }
                      className="bg-bg border border-secondary/50 rounded-md px-2 py-1 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddVariant(field)}
                      className="bg-primary text-white rounded-md px-3 py-1 text-center flex items-center justify-center"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="flex flex-row gap-2 flex-wrap">
                    {field.state.value?.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-row items-center justify-center gap-1 p-1 bg-bg-100 m-1 rounded-sm"
                      >
                        <p>
                          {item.name} ({item.vals.length})
                        </p>
                        <X
                          size={14}
                          className="h-full hover:cursor-pointer"
                          onClick={() => {
                            const updatedVariants = field.state.value.filter(
                              (_, i) => i !== index,
                            );
                            field.handleChange(updatedVariants);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            />
          </div>

          {/* Specifications */}
          <div>
            <form.Field
              name="specs"
              validators={{
                onChangeAsyncDebounceMs: 500,
                onChangeAsync: ({ value }) =>
                  !value
                    ? "Specifications are required"
                    : value.length < 3
                      ? "Atleast 3 Specifications are required"
                      : undefined,
              }}
              children={(field) => (
                <div className="flex flex-col w-min">
                  <p className="font-bold text-2xl mb-1">Specification *</p>
                  <p className="font-thin text-sm">minimum 3</p>
                  <div className="flex flex-col md:flex-row flex-wrap gap-2">
                    <input
                      type="text"
                      placeholder="Spec Name"
                      value={newSpec.name}
                      onChange={(e) =>
                        setNewSpec({ ...newSpec, name: e.target.value })
                      }
                      className="bg-bg border border-secondary/50 rounded-md px-2 py-1 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Spec Value"
                      value={newSpec.value}
                      onChange={(e) =>
                        setNewSpec({ ...newSpec, value: e.target.value })
                      }
                      className="bg-bg border border-secondary/50 rounded-md px-2 py-1 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSpec(field)}
                      className="bg-primary text-white rounded-md px-3 py-1 text-center flex items-center justify-center"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="flex flex-row gap-2 flex-wrap">
                    {field.state.value?.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-row items-center justify-center gap-1 p-1 bg-bg-100 m-1 rounded-sm"
                      >
                        <p>
                          {item.name}: {item.value}
                        </p>
                        <X
                          size={14}
                          className="h-full hover:cursor-pointer"
                          onClick={() => {
                            const updatedSpecs = field.state.value.filter(
                              (_, i) => i !== index,
                            );
                            field.handleChange(updatedSpecs);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <FieldInfo field={field} />
                </div>
              )}
            />
          </div>

          {/* Keywords */}
          <div>
            <form.Field
              name="keywords"
              validators={{
                onChangeAsyncDebounceMs: 500,
                onChangeAsync: ({ value }) =>
                  !value
                    ? "Keywords are required"
                    : value.length < 2 || value.length > 8
                      ? "2-8 keywords are required"
                      : undefined,
              }}
              children={(field) => (
                <div className="flex flex-col w-min">
                  <p className="font-bold text-2xl mb-1">Keywords *</p>
                  <p className="font-thin text-sm">minimum 2 - maximum 8</p>
                  <div className="flex flex-row gap-2 flex-wrap w-max">
                    <input
                      type="text"
                      value={newKeywords}
                      placeholder="Keyword"
                      onChange={(e) => setNewKeywords(e.target.value)}
                      className="bg-bg border border-secondary/50 rounded-md px-2 py-1 outline-none"
                    />
                    {field.state.value.length <= 8 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updateKeywords = [
                            ...field.state.value,
                            newKeywords,
                          ];
                          setNewKeywords("");
                          field.handleChange(updateKeywords);
                        }}
                        className="bg-primary text-white rounded-md px-3 py-1"
                      >
                        <Plus size={20} />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-row gap-2 flex-wrap">
                    {field.state.value?.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-row items-center justify-center gap-1 p-1 bg-bg-100 m-1 rounded-sm"
                      >
                        <p>{item}</p>
                        <X
                          size={14}
                          className="h-full hover:cursor-pointer"
                          onClick={() => {
                            const updatedKeywords = field.state.value.filter(
                              (_, i) => i !== index,
                            );
                            field.handleChange(updatedKeywords);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <FieldInfo field={field} />
                </div>
              )}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
