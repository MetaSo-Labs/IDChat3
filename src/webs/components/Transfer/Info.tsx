import { View, Text, StyleSheet } from "react-native";
import { shortestAddress } from "@/lib/formatters";
import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import type {
  Receiver,
  TransferTask,
} from "../../actions/lib/authorize/transfer";
import { Table, Row, Rows } from "react-native-table-component";

function prettyAmount(task: TransferTask, receiver: Receiver) {
  if (!task.genesis) {
    return Number(receiver.amount) / 1e8;
  }

  return receiver.amount;
}

const Info = forwardRef(
  (
    {
      params,
      children,
    }: {
      children?: React.ReactNode;
      params: {
        tasks: TransferTask[];
      };
    },
    ref
  ) => {
    const [tasks, setTasks] = React.useState([]);

    useImperativeHandle(ref, () => ({
      getEstimatedData: () => {
        return params;
      },
    }));

    useEffect(() => {
      const tasks = params.tasks.flatMap((task) =>
        task.receivers.map((receiver) => [
          task.genesis ? "Token" : "SPACE",
          prettyAmount(task, receiver),
          shortestAddress(receiver.address),
        ])
      );
      setTasks(tasks);
    }, [params.tasks]);

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        padding: 16,
        paddingTop: 30,
        backgroundColor: "#fff",
      },
      head: { height: 40, backgroundColor: "#f1f8ff" },
      text: { margin: 6 },
    });

    return (
      <View style={{ marginBottom: 8 }}>
        {children ? children : null}
        <Table
          style={{}}
          borderStyle={{ borderWidth: 2, borderColor: "#c8e1ff" }}
        >
          <Row
            style={styles.head}
            textStyle={styles.text}
            data={["Asset", "Amount", "Receiver"]}
          />
          <Rows data={tasks} textStyle={styles.text} />
        </Table>
      </View>
    );
  }
);

export default Info;
