"use client";
import React, { useEffect, useState } from "react";
import { fetchProduct } from "./fetch";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Cross, Plus, X } from "lucide-react";
import { useFilePicker } from "use-file-picker";
import {
  FileAmountLimitValidator,
  FileTypeValidator,
  FileSizeValidator,
  ImageDimensionsValidator,
} from "use-file-picker/validators";
import { updateImage, updateProduct } from "./post";
import { useForm } from "@tanstack/react-form";
import Loading from "@/components/Loading";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/firebase";

const defaultData = {
  categories: [
    "Electronics",
    "Computer Accessories",
    "Men Clothing",
    "Women Clothin",
    "Kids Clothing",
    "Laptops",
    "Computers",
    "Mobiles",
    "Accessories",
    "Makeup",
    "Perfumes",
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
export default function page({ params }) {
  const { id } = params;
  const [product, setProduct] = useState();
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [newVariant, setNewVariant] = useState({ name: "", vals: "" });
  const [newSpec, setNewSpec] = useState({ name: "", value: "" });
  const [newKeywords, setNewKeywords] = useState();
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
      setNewSpec({ name: "", value: "" }); // Reset the input fields
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

      setNewVariant({ name: "", vals: "" }); // Reset the input fields
    }
  };
  const { openFilePicker, filesContent, errors } = useFilePicker({
    readAs: "DataURL",
    accept: "image/*",
    multiple: true,
    validators: [
      new FileAmountLimitValidator({ max: 1 }),
      new FileTypeValidator(["jpg", "png"]),
      new FileSizeValidator({ maxFileSize: 2 * 1024 * 1024 }),
      new ImageDimensionsValidator({
        maxHeight: 900,
        maxWidth: 1600,
      }),
    ],
  });

  const form = useForm({
    defaultValues: product,
    onSubmit: async ({ value }) => {
      delete value["id"];
      updateProduct(product.id, value);
    },
  });

  const [img_index, setImageIndex] = useState();
  useEffect(() => {
    if (filesContent.length > 0) {
      const file = filesContent;

      const images = product.imageRef;
      updateImage(images, img_index, file[0], product.id)
        .then(() => {
          init();
          //router.refresh();
        })
        .catch((e) => {
          console.log(e);
          toast("Internal Server Error!");
        });
    } else if (errors && errors.length > 0) {
      console.log(errors);
      toast("Incorrect File");
    }
  }, [img_index, filesContent]);

  async function init() {
    fetchProduct(id, user.uid)
      .then((data) => {
        setProduct(data);
      })
      .catch((e) => {
        console.error(e);

        toast("Product doesnot exists!");
        // setTimeout(() => {}, 1000);
        router.push("/product/catelog");
      });
  }
  useEffect(() => {
    if (id) {
      init();
    }
  }, []);

  if (!product || form.state.isSubmitting) {
    return (
      <div className="flex w-full h-full bg-bg items-center justify-center">
        <div className="w-40 h-40">
          <Loading className="text-text w-32" />
        </div>
      </div>
    );
  }
  return (
    <div className="bg-bg min-h-screen w-full  py-6 sm:px-6 lg:px-10">
      <p className="font-black text-2xl">Product Overview</p>
      <p className="font-thin text-sm">Id: {product.id}</p>
      <div className="flex flex-col gap-4">
        <p className="font-bold text-2xl mt-14">Images*</p>
        <div className="grid grid-cols-2 md:grid-cols-10 gap-4 h-min">
          {[
            ...Array(
              product.images.length === 5 ? 5 : product.images.length + 1,
            ),
          ].map((_, index) => {
            return (
              <div
                onClick={() => {
                  openFilePicker();
                  setImageIndex(index);
                }}
                className="p-1 h-52 max-h-96 overflow-hidden border bg-bg hover:cursor-pointer shadow-sm duration-300 hover:shadow-md rounded-md border-secondary/40 group"
              >
                {product.images.length > index ? (
                  <img
                    src={product.images[index]}
                    className="h-52 object-contain aspect-auto group-hover:opacity-70 duration-300"
                  />
                ) : (
                  <div className="flex flex-col h-full group-hover:opacity-50  items-center justify-center duration-300">
                    <p>Add Image</p>
                    <Plus className="text-text" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className=" justify-end flex flex-row w-full gap-2">
          <button
            disabled={product.sponsered && product.premium}
            className="bg-bg border border-primary disabled:opacity-30 disabled:bg-bg disabled:text-primary hover:bg-primary hover:text-bg duration-150 transition-all rounded-md px-6 py-2 text-primary"
            onClick={() => {
              router.push(`/product/premium?pid=${product.id}`);
            }}
          >
            Boost Product
          </button>
          <button
            className="bg-primary  border border-primary hover:bg-bg hover:text-primary duration-150 transition-all rounded-md px-6 py-2 text-bg"
            onClick={() => {
              form.handleSubmit();
            }}
          >
            Update
          </button>
        </div>

        <div className=" justify-end flex flex-col w-full gap-1">
          <p
            className={`text-sm ${product.premium ? "text-green-300" : "text-gray-400"} text-end`}
          >
            Premium
          </p>
          <p
            className={`text-sm ${product.sponsered ? "text-green-300" : "text-gray-400"} text-end`}
          >
            Sponsered
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 "
        >
          <div>
            <form.Field
              name={"name"}
              children={(field) => (
                <>
                  <p className="font-bold text-2xl mb-2">Title *</p>
                  <input
                    className="bg-bg border border-secondary/50 rounded-md px-2 py-1 min-w-full lg:min-w-96 outline-none"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                    }}
                  />
                </>
              )}
            />
          </div>

          <div>
            <form.Field
              name={"price"}
              children={(field) => (
                <>
                  <p className="font-bold text-2xl mb-2">Price *</p>
                  <input
                    className="bg-bg border border-secondary/50 rounded-md px-2 py-1 min-w-full lg:min-w-96 outline-none"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    type="number"
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </>
              )}
            />
          </div>

          <div>
            <form.Field
              validators={{
                onChangeAsyncDebounceMs: 500,
                onChangeAsync: ({ value }) =>
                  !value
                    ? "Shipping Cost is required"
                    : value < 0 * cr
                      ? `Minium shipping is ${0 * cr} ${sellerCurrency}`
                      : undefined,
              }}
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
                </div>
              )}
            />
          </div>

          <div>
            <form.Field
              name={"shortDescription"}
              children={(field) => (
                <>
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
                </>
              )}
            />
          </div>

          <div>
            <form.Field
              name={"brand"}
              children={(field) => (
                <>
                  <p className="font-bold text-2xl mb-2">Brand *</p>
                  <input
                    className="bg-bg border outline-none border-secondary/50 rounded-md px-2 py-1 min-w-full lg:min-w-96"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </>
              )}
            />
          </div>

          <div>
            <form.Field
              name={"stock"}
              children={(field) => (
                <>
                  <p className="font-bold text-2xl mb-2">Stock *</p>
                  <input
                    className="bg-bg border outline-none border-secondary/50 rounded-md px-2 py-1 min-w-full lg:min-w-96"
                    id={field.name}
                    name={field.name}
                    type="number"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </>
              )}
            />
          </div>
          <div>
            <form.Field
              name={"category"}
              children={(field) => (
                <>
                  <p className="font-bold text-2xl mb-2">Category *</p>
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
                  <p className="font-bold text-2xl mb-1">Delivery Time *</p>
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
                  <p className="font-bold text-2xl mb-1">Return Policy *</p>
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

          <div>
            <form.Field
              name={"variants"}
              children={(field) => (
                <>
                  <p className="font-bold text-2xl mb-1">Variants</p>
                  <div className="flex flex-row flex-wrap gap-2">
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
                      className="bg-primary text-white rounded-md px-3 py-1"
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

          <div>
            <form.Field
              name="specs"
              children={(field) => (
                <>
                  <p className="font-bold text-2xl mb-1">Specification *</p>
                  <p className="font-thin text-sm">minimum 3</p>
                  <div className="flex flex-row flex-wrap gap-2">
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
                      className="bg-primary text-white rounded-md px-3 py-1"
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
                </>
              )}
            />
          </div>

          <div>
            <form.Field
              name="keywords"
              children={(field) => (
                <>
                  <p className="font-bold text-2xl mb-1">Keywords *</p>
                  <p className="font-thin text-sm">minimum 2 - maximum 8</p>
                  <div className="flex flex-row gap-2 flex-wrap">
                    <input
                      type="text"
                      value={newKeywords}
                      placeholder="Keyword"
                      onChange={(e) => setNewKeywords(e.target.value)}
                      className="bg-bg border border-secondary/50 rounded-md px-2 py-1 outline-none"
                    />
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
                </>
              )}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
