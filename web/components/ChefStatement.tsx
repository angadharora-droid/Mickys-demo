import { Line } from "./ScrollCopy";

type Props = {
  index: number;
  first: string;
  second: string;
};

/** One editorial statement: two masked lines over a hairline rule. */
export default function ChefStatement({ index, first, second }: Props) {
  return (
    <li data-statement={index} className="chef-statement border-t border-maroon/20 pt-[0.35em]">
      <p className="display m-0 text-maroon">
        <Line>{first}</Line>
        <Line className="text-maroon/55">{second}</Line>
      </p>
    </li>
  );
}
