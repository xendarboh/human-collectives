import type {
  ActionFunction,
  DataFunctionArgs,
  LoaderFunction,
} from "@remix-run/node";
import invariant from "tiny-invariant";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useCatch,
  useLoaderData,
  useTransition,
} from "@remix-run/react";

import type { Collective } from "~/models/collective.server";
import type { CollectiveJoinFormActionData } from "~/ui/collective-join-form";
import type {
  ProofOfCollective,
  ProofOfCollectiveVerification,
} from "~/models/proof.server";
import { AlertError, AlertSuccess } from "~/ui/alerts";
import { CollectiveJoinForm } from "~/ui/collective-join-form";
import { ModalFormSubmission } from "~/ui/modal-form-submission";
import { requireAuthenticatedUser } from "~/auth.server";
import {
  isCollectiveMember,
  joinCollective,
  leaveCollective,
} from "~/models/member.server";
import {
  getProofOfCollectiveExclusion,
  getProofOfCollectiveInclusion,
  verifyProofOfCollective,
} from "~/models/proof.server";
import {
  deleteCollective,
  getCollective,
  isCollectiveCreator,
} from "~/models/collective.server";

type LoaderData = {
  collective: Collective;
  isCreator: boolean;
  isMember: boolean;
};

type ActionData = {
  joinForm?: CollectiveJoinFormActionData;
  proofOfExclusion?: ProofOfCollective;
  proofOfInclusion?: ProofOfCollective;
  proofVerification?: ProofOfCollectiveVerification;
};

export const common = async ({ params, request }: DataFunctionArgs) => {
  const auth = await requireAuthenticatedUser(request);

  invariant(params.id, "Collective ID not found");
  const collective = await getCollective({ id: +params.id });
  if (!collective) throw new Response("Collective Not Found", { status: 404 });

  const isCreator = isCollectiveCreator(collective, auth.user.id);
  const isMember = await isCollectiveMember(collective, auth.user.id);

  if (!collective.isOpenAccess && !isCreator) collective.accessCode = "";

  return { auth, collective, isCreator, isMember };
};

export const loader: LoaderFunction = async (args) =>
  json<LoaderData>(await common(args));

export const action: ActionFunction = async (args) => {
  const { auth, collective, isCreator, isMember } = await common(args);
  const formData = await args.request.formData();

  switch (formData.get("action")) {
    case "delete": {
      if (!isCreator) {
        throw new Response("Only the collective creator can delete it", {
          status: 403,
        });
      }
      await deleteCollective(collective.id);
      return redirect("/collectives");
    }

    case "leaveCollective": {
      if (!isMember) {
        throw new Response(
          "Only a collective member can leave the collective",
          {
            status: 403,
          }
        );
      }
      await leaveCollective(collective.id, auth.user.id);
      return null;
    }

    case "joinCollective": {
      if (isMember) {
        throw new Response("Only a non-member can join the collective", {
          status: 403,
        });
      }

      const values = {
        accessCode: formData.get("accessCode")?.toString(),
      };
      const [errors, member] = await joinCollective(+auth.user.id, values);
      if (errors || !member)
        return json({ joinForm: { errors, values } }, { status: 400 });
      return null;
    }

    case "proveInclusion": {
      const proofOfInclusion = await getProofOfCollectiveInclusion(
        collective.id,
        auth.user.id
      );
      if (!proofOfInclusion)
        throw new Response("Failed to generate Proof of Collective Inclusion", {
          status: 500,
        });
      return json({ proofOfInclusion });
    }

    case "proveExclusion": {
      const proofOfExclusion = await getProofOfCollectiveExclusion(
        collective.id,
        auth.user.id
      );
      if (!proofOfExclusion)
        throw new Response("Failed to generate Proof of Collective Exclusion", {
          status: 500,
        });
      return json({ proofOfExclusion });
    }

    case "verifyProof": {
      const data = formData.get("proofToVerify")?.toString();
      const proofToVerify = JSON.parse(data + "");
      if (!proofToVerify)
        throw new Response("Proof of Collective Verification Failed", {
          status: 500,
        });
      const proofVerification = await verifyProofOfCollective(proofToVerify);
      return json({ proofVerification });
    }

    default: {
      throw new Error("Unknown Action");
    }
  }
};

export default function CollectiveDetailsPage() {
  const { collective, isCreator, isMember } = useLoaderData() as LoaderData;
  const actionData = useActionData() as ActionData;
  const transition = useTransition();

  const isSubmitting =
    transition.state === "submitting" || transition.state === "loading";

  let proofType = "Unknown";
  if (actionData?.proofVerification?.publicSignals.fnc === 1)
    proofType = "Exclusion";
  if (actionData?.proofVerification?.publicSignals.fnc === 0)
    proofType = "Inclusion";

  return (
    <div className="mb-4">
      <h3 className="text-2xl font-bold">{collective.title}</h3>
      <div className="grid gap-4">
        <pre className="py-6">{collective.description}</pre>

        <div className="grid items-center gap-2">
          <span className="witespace-nowrap">Current Merkle Tree Root:</span>
          <span className="rounded-box border-2 border-neutral bg-base-200 p-2 px-3 shadow-md">
            <Link to="data.json" reloadDocument>
              {collective.merkleRoot}
            </Link>
          </span>
        </div>

        {!isMember && (
          <div className="rounded-box grid gap-4 border-2 border-base-content bg-base-300 p-4 shadow-md">
            <div className="text-lg font-bold">
              You are not a Collective Member
            </div>
            <Form method="post">
              <div className="flex gap-4">
                <button
                  type="submit"
                  name="action"
                  value="proveExclusion"
                  className="btn btn-primary"
                >
                  Prove It
                </button>
              </div>
            </Form>
            <CollectiveJoinForm
              method="post"
              actionData={actionData?.joinForm}
              collective={collective}
            >
              <input type="hidden" name="action" value="joinCollective" />
            </CollectiveJoinForm>
          </div>
        )}

        {isMember && (
          <div className="rounded-box grid gap-4 border-2 border-base-content bg-base-300 p-4 shadow-md">
            <div className="text-lg font-bold">You are a Collective Member</div>
            <Form method="post">
              <div className="flex gap-4">
                <button
                  type="submit"
                  name="action"
                  value="proveInclusion"
                  className="btn btn-primary"
                >
                  Prove It
                </button>
                <button
                  type="submit"
                  name="action"
                  value="leaveCollective"
                  className="btn btn-warning"
                >
                  Leave
                </button>
              </div>
            </Form>
          </div>
        )}

        {!isMember && actionData?.proofOfExclusion && (
          <div className="rounded-box grid gap-4 border-2 border-base-content bg-base-300 p-4 shadow-md">
            <div className="text-lg font-bold">
              Proof of Collective Exclusion
            </div>
            <div>{JSON.stringify(actionData.proofOfExclusion, null, 1)}</div>
          </div>
        )}

        {isMember && actionData?.proofOfInclusion && (
          <div className="rounded-box grid gap-4 border-2 border-base-content bg-base-300 p-4 shadow-md">
            <div className="text-lg font-bold">
              Proof of Collective Inclusion
            </div>
            <div>{JSON.stringify(actionData.proofOfInclusion, null, 1)}</div>
          </div>
        )}

        <div className="rounded-box grid gap-4 border-2 border-base-content bg-base-300 p-4 shadow-md">
          <div className="text-lg font-bold">Verify Proof of Collective</div>
          {actionData?.proofVerification !== undefined && (
            <>
              {actionData.proofVerification.isValid === true ? (
                <AlertSuccess>
                  Verification Successful for Collective {proofType}
                </AlertSuccess>
              ) : (
                <AlertError>
                  Verification Failed for Collective {proofType}
                </AlertError>
              )}
            </>
          )}
          <Form method="post">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Proof to Verify</span>
              </label>
              <textarea
                name="proofToVerify"
                className="textarea textarea-bordered textarea-primary h-36 bg-primary-content"
                placeholder=""
              ></textarea>
            </div>
            <div className="mt-4 flex gap-4">
              <button
                type="submit"
                name="action"
                value="verifyProof"
                className="btn btn-primary"
              >
                Verify
              </button>
            </div>
          </Form>
        </div>

        {isCreator && (
          <div className="rounded-box grid gap-4 border-2 border-base-content bg-base-300 p-4 shadow-md">
            <div className="text-lg font-bold">
              You are the Collective Creator
            </div>
            <div className="flex flex-grow items-center gap-2">
              <span className="witespace-nowrap">Membership Access Code:</span>
              <span className="rounded-box border-2 border-neutral bg-base-200 p-2 px-3 shadow-md">
                {collective.accessCode}
              </span>
            </div>
            <Form method="post">
              <div className="flex gap-4">
                <Link to="edit" className="btn btn-primary">
                  Edit
                </Link>
                <button
                  type="submit"
                  name="action"
                  value="delete"
                  className="btn btn-warning"
                >
                  Delete
                </button>
              </div>
            </Form>
            {/*
            <Form method="post">
              <div className="flex w-full flex-col lg:flex-row">
                {collective.members?.map((member, key) => (
                  <div key={key}>{member.userId}</div>
                ))}
              </div>
            </Form>
          */}
            {/*
            <pre className="whitespace-pre-line">
              {JSON.stringify(collective, null, 2)}
            </pre>
          */}
          </div>
        )}
      </div>

      <ModalFormSubmission open={isSubmitting}>
        <h3 className="text-lg font-bold">Processing... Please Wait.</h3>
      </ModalFormSubmission>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  switch (caught.status) {
    case 403:
    case 404:
    case 500:
      return <div>{caught.data}</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
